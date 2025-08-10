import { Redis } from '@upstash/redis'
import { Pinecone } from '@pinecone-database/pinecone';
// import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

/**
 * @brief Represents a unique identifier for a companion chat session
 * @details This type is used to generate unique keys for storing and retrieving
 * chat history and vector embeddings for specific user-companion interactions
 */
export type CompanionKey = {
    /** @brief The name/identifier of the AI companion */
    companionName: string;
    /** @brief The AI model name being used for this companion */
    modelName: string;
    /** @brief The unique identifier of the user */
    userId: string;
}


/**
 * @brief Manages memory operations for AI companions including chat history and vector search
 * @details This singleton class handles both Redis-based chat history storage and 
 * Pinecone vector database operations for semantic search functionality.
 * It provides methods to store, retrieve, and search through conversation data.
 */
export class MemoryManager {
    /** @brief Singleton instance of the MemoryManager */
    private static instance: MemoryManager;
    /** @brief Redis client for storing chat history */
    private history: Redis;
    /** @brief Pinecone client for vector database operations */
    private vectorDBClient: Pinecone;

    /**
     * @brief Constructs a new MemoryManager instance
     * @details Initializes Redis and Pinecone clients using environment variables.
     * Redis is configured from environment variables, while Pinecone requires
     * API key and environment/region configuration.
     */
    public constructor() {
        this.history = Redis.fromEnv();
        this.vectorDBClient = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
            maxRetries: 5,
        });
    }

    /**
     * @brief Performs semantic search on stored companion conversations
     * @details Searches through previously stored conversation embeddings in Pinecone
     * to find contextually similar messages. This enables the AI to reference
     * relevant past conversations when generating responses.
     * 
     * @param recentChatHistory The recent chat context to search for similar content
     * @param companionFileName The specific companion's data file to search within
     * @return Promise<Document[]> Array of similar documents found, limited to 4 results
     * 
     * @note This method does not store new data in Pinecone, only retrieves existing embeddings
     * @warning If vector search fails, returns undefined and logs a warning
     */
    // does not store anything in pinecone
    public async vectorSearch(recentChatHistory: string, companionFileName: string) {
        const pineconeIndex = this.vectorDBClient.index(process.env.PINECONE_INDEX!);

        // const embeddings = new OpenAIEmbeddings({
        //     model: "text-embedding-3-small", apiKey: process.env.OPENAI_API_KEY!
        // });

        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY!,
            model: "text-embedding-004", // Latest model - 768 dimensions
            maxConcurrency: 5,
            maxRetries: 5,
        })

        const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            maxConcurrency: 5
        });

        const similarDocs = await vectorStore.similaritySearch(recentChatHistory, 4, { fileName: companionFileName }).catch((err) => {
            console.warn("WARNING: failed to get vector search results.", err);
            return undefined;
        });
        
        return similarDocs;
    };

    /**
     * @brief Stores conversation data in Pinecone vector database
     * @details Takes conversation text, creates embeddings, and stores them in Pinecone
     * for future semantic search. This enables the AI to reference relevant past conversations.
     * 
     * @param text The conversation text to store as vectors
     * @param companionFileName The specific companion's data file identifier
     * @return Promise<boolean> True if successful, false otherwise
     */
    public async storeInPinecone(text: string, companionFileName: string): Promise<boolean> {
        try {
            const pineconeIndex = this.vectorDBClient.index(process.env.PINECONE_INDEX!);

            const embeddings = new GoogleGenerativeAIEmbeddings({
                apiKey: process.env.GEMINI_API_KEY!,
                model: "text-embedding-004", // Latest model - 768 dimensions
                maxConcurrency: 5,
                maxRetries: 5,
            });

            const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
                pineconeIndex,
                maxConcurrency: 5
            });

            // Split text into chunks if it's too long
            const chunks = this.splitTextIntoChunks(text, 1000);
            
            for (let i = 0; i < chunks.length; i++) {
                await vectorStore.addDocuments([{
                    pageContent: chunks[i],
                    metadata: { 
                        fileName: companionFileName,
                        chunkIndex: i,
                        timestamp: Date.now()
                    }
                }]);
            }

            return true;
        } catch (error) {
            console.error("Error storing in Pinecone:", error);
            return false;
        }
    }

    /**
     * @brief Splits text into manageable chunks for vector storage
     * @details Breaks long text into smaller pieces to avoid embedding size limits
     * 
     * @param text The text to split
     * @param chunkSize Maximum size of each chunk
     * @return string[] Array of text chunks
     */
    private splitTextIntoChunks(text: string, chunkSize: number = 1000): string[] {
        const chunks: string[] = [];
        for (let i = 0; i < text.length; i += chunkSize) {
            chunks.push(text.slice(i, i + chunkSize));
        }
        return chunks;
    }

    /**
     * @brief Gets or creates the singleton instance of MemoryManager
     * @details Implements the singleton pattern to ensure only one MemoryManager
     * instance exists throughout the application lifecycle. This prevents
     * multiple database connections and ensures consistent memory management.
     * 
     * @return Promise<MemoryManager> The singleton MemoryManager instance
     */
    public static async getInstance(): Promise<MemoryManager> {
        if (!MemoryManager.instance) {
            MemoryManager.instance = new MemoryManager();
        }
        return MemoryManager.instance;
    }

    /**
     * @brief Generates a unique Redis key for a companion chat session
     * @details Creates a composite key by combining companion name, model name,
     * and user ID. This ensures each user's conversation with each companion
     * using each model is stored separately in Redis.
     * 
     * @param companionKey Object containing companion, model, and user identifiers
     * @return string The generated Redis key in format: "companionName-modelName-userId"
     */
    private generateRedisCompanionKey(companionKey: CompanionKey): string {
        return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`;
    }

    /**
     * @brief Stores a new message in the chat history
     * @details Adds a timestamped message to the Redis sorted set for the given
     * companion session. Messages are scored by timestamp to maintain chronological order.
     * 
     * @param text The message content to store
     * @param companionKey Unique identifier for the companion chat session
     * @return Promise<number | string> Redis operation result, or empty string on error
     * 
     * @warning Returns empty string and logs error if companionKey is invalid or userId is undefined
     */
    public async writeToHistory(text: string, companionKey: CompanionKey) {
        if (!companionKey || typeof companionKey.userId == "undefined") {
            console.log("Companion key set incorrectly, cannot write history!!!");
            return "";
        }
        const key = this.generateRedisCompanionKey(companionKey);
        const res = await this.history.zadd(key, {
            score: Date.now(),
            member: text,
        });

        return res;
    }

    /**
     * @brief Retrieves the most recent chat history for a companion session
     * @details Fetches timestamped messages from Redis sorted set, limits to the
     * most recent 30 messages, and formats them as a single string with newline separators.
     * Messages are returned in chronological order (oldest to newest).
     * 
     * @param companionKey Unique identifier for the companion chat session
     * @return Promise<string> Formatted chat history string, or empty string on error
     * 
     * @warning Returns empty string and logs error if companionKey is invalid or userId is undefined
     * @note Automatically limits results to last 30 messages to prevent excessive context length
     */
    public async readLatestHistory(companionKey: CompanionKey): Promise<string> {
        if (!companionKey || typeof companionKey.userId === "undefined") {
            console.error("Companion key set incorrectly, cannot read history!!!");
            return "";
        }

        const key = this.generateRedisCompanionKey(companionKey);
        let res = await this.history.zrange(key, 0, Date.now(), {
            byScore: true,
        });

        // console.log("Read latest history", res);
        res = res.slice(-30).reverse();

        const recentChats = res.reverse().join("\n");
        return recentChats;
    }

    /**
     * @brief Initializes chat history with predefined seed content
     * @details Populates the Redis sorted set with initial conversation data,
     * typically used to give companions background context or personality traits.
     * Only seeds if no existing history exists for the given companion key.
     * 
     * @param seedContent The initial content to populate the chat history
     * @param delimiter Character(s) used to split the seed content into individual messages (default: "\n")
     * @param companionKey Unique identifier for the companion chat session
     * 
     * @note If chat history already exists for the companion key, this method returns early
     * @note Each line of seed content is stored with an incrementing score for chronological order
     */
    public async seedChatHistory(
        seedContent: string,
        delimiter: string = "\n",
        companionKey: CompanionKey
    ) {
        const key = this.generateRedisCompanionKey(companionKey);
        if (await this.history.exists(key)) {
            console.log("User already has chat history");
            return;
        }

        const content = seedContent.split(delimiter);
        let counter = 0;
        for (const line of content) {
            await this.history.zadd(key, { score: counter++, member: line });
        }
    }
}