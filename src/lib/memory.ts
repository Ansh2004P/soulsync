import { Redis } from '@upstash/redis'

export type CompanionKey = {
    companionName: string;
    modelName: string;
    userId: string;
}


export class MemoryManager {
    private static instance: MemoryManager;
    private history: Redis;

    public constructor() {
        this.history = Redis.fromEnv();

    }

    public static async getInstance(): Promise<MemoryManager> {
        if (!MemoryManager.instance) {
            MemoryManager.instance = new MemoryManager();
        }
        return MemoryManager.instance;
    }

    private generateRedisCompanionKey(companionKey: CompanionKey): string {
        return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`;
    }

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

    public async seedChatHistory(
        seedContent: string,
        delimiter: string ="\n",
        companionKey: CompanionKey
    ) {
        const key =this.generateRedisCompanionKey(companionKey);
        if(await this.history.exists(key)) {
            console.log("User already has chat history");
            return;
        }

        const content =seedContent.split(delimiter);
        let counter =0;
        for(const line of content) {
            await this.history.zadd(key, {score: counter++, member: line});
        }
    }
}