
import { getCurrentUser } from "@/hooks/use-currenUser";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { MemoryManager } from "@/lib/memory";
import { ratelimit } from "@/lib/ratelimiter";


interface ChatIdProps {
  params: Promise<{ chatId: string }>
}


export async function POST(
  request: Request,
  { params }: ChatIdProps
) {
  try {
    const { chatId } = await params;
    const { prompt } = await request.json();
    const user = await getCurrentUser();

    if (!user || !user.given_name || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }


    const { success } = await ratelimit.limit(user.id);

    if (!success) {
      return new NextResponse(
        "Too many requests. Please wait before trying again.",
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Store user message
    const companion = await prismadb.companion.update({
      where: { id: chatId },
      data: {
        messages: {
          create: {
            content: prompt,
            role: "user",
            userId: user.id,
          },
        },
      },
      include: { messages: true },
    });

    if (!companion) {
      return new NextResponse("Companion not found", { status: 404 });
    }

    const name = companion.id;
    const companion_file_name = name + ".txt";

    const companionKey = {
      companionName: name!,
      userId: user.id,
      modelName: "gemini-2.5-flash",
    };

    const memoryManager = await MemoryManager.getInstance();

    const records = await memoryManager.readLatestHistory(companionKey);
    if (records.length === 0) {
      await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey);
    }
    await memoryManager.writeToHistory("User: " + prompt + "\n", companionKey);

    // Query Pinecone
    const recentChatHistory = await memoryManager.readLatestHistory(companionKey);

    const similarDocs = await memoryManager.vectorSearch(
      recentChatHistory,
      companion_file_name
    );

    let relevantHistory = "";
    if (!!similarDocs && similarDocs.length !== 0) {
      relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
    }

    // Call Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
                ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${companion.name}: prefix. 

                ${companion.instructions}

                 Below are relevant details about ${companion.name}'s past and the conversation you are in.
                 ${relevantHistory}
                 
                 
                 ${recentChatHistory}\n${companion.name}:`
            },
          ],
        },
      ],
    });

    if (!result) {
      return new NextResponse("Failed to generate response", { status: 500 });
    }
    const replyText =
      result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No reply";

    // console.log("Gemini reply:", replyText)

    // Save Gemini's reply
    await prismadb.companion.update({
      where: { id: chatId },
      data: {
        messages: {
          create: {
            content: replyText,
            role: "system",
            userId: user.id,
          },
        },
      },
    });

    // Store the conversation in Pinecone for future vector search
    const conversationToStore = `User: ${prompt}\n${companion.name}: ${replyText}`;
    await memoryManager.storeInPinecone(conversationToStore, companion_file_name);
    await memoryManager.writeToHistory(`${companion.name}: ` + replyText + "\n", companionKey);

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error("Error in POST request:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
