import { getCurrentUser } from "@/hooks/use-currenUser";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";


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
                ONLY generate plain sentences without prefix of who is speaking.
                ${companion.instructions}
                 User: ${prompt}
                `
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

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error("Error in POST request:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
