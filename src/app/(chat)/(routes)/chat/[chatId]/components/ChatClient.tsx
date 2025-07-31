"use client";

import { ChatForm } from "@/components/chat-form";
import { ChatHeader } from "@/components/chat-header";
import { ChatMessageProps } from "@/components/chat-message";
import { ChatMessages } from "@/components/chat-messages";
import { Companion, Message } from "@/generated/prisma";
import { useRouter } from "next/navigation";
import { FormEvent, useState, ChangeEvent } from "react";
import toast from "react-hot-toast";

interface ChatClientProps {
    companion: Companion & {
        messages: Message[];
        _count: { messages: number };
    };
}

export const ChatClient = ({ companion }: ChatClientProps) => {
    const router = useRouter();
    const [messages, setMessages] = useState<ChatMessageProps[]>(
        companion.messages || []
    );
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add the user’s message to UI
        const userMessage: ChatMessageProps = {
            role: "user",
            content: input,
        };
        setMessages((current) => [...current, userMessage]);

        const prompt = input;
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch(`/api/chat/${companion.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch response");
            }

            const data = await response.json();

            const botMessage: ChatMessageProps = {
                role: "system",
                content: data.reply,
            };

            setMessages((current) => [...current, botMessage]);
        } catch (error) {
            // console.error("Error fetching Gemini response:", error);
            toast.error("⚠️ Sorry, something went wrong. Please try again.");
            
            setMessages((current) => [...current]);
        } finally {
            setIsLoading(false);
            router.refresh(); // ensures db state sync
        }
    };

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
    ) => {
        setInput(e.target.value);
    };

    return (
        <div className="flex flex-col h-screen p-4 space-y-2">
            <ChatHeader companion={companion} />
            <ChatMessages
                companion={companion}
                isLoading={isLoading}
                messages={messages}
            />
            <ChatForm
                isLoading={isLoading}
                input={input}
                handleInputChange={handleInputChange}
                onSubmit={onSubmit}
            />
        </div>
    );
};
