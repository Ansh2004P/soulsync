"use client";

import { ChatForm } from "@/components/chat-form";
import { ChatHeader } from "@/components/chat-header";
import { ChatMessageProps } from "@/components/chat-message";
import { ChatMessages } from "@/components/chat-messages";
import { Companion, Message } from "@/generated/prisma";
import { useRouter } from "next/navigation";
import { ChangeEvent, ChangeEventHandler, FormEvent, useState } from "react";

interface ChatClientProps {
    companion: Companion & {
        messages: Message[];
        _count: {
            messages: number;
        }
    };
};

export const ChatClient = ({ companion }: ChatClientProps) => {
    const router = useRouter();
    const [messages, setMessages] = useState<ChatMessageProps[]>(companion.messages || []);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim()) return;
        const userMessage: ChatMessageProps = {
            role: "user",
            content: input,
        };

        setMessages((current) => [...current, userMessage]);
        setInput("");
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
    };
    return (
        <div className="flex flex-col h-screen p-4 space-y-2">
            <ChatHeader companion={companion} />
            <ChatMessages
                companion={companion}
                isLoading={false}
                messages={messages}
            />
            <ChatForm
                isLoading={isLoading}
                input={input}
                handleInputChange={handleInputChange}
                onSubmit={onSubmit}
            />
        </div>
    )
}