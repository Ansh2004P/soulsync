"use client";

import { ChatForm } from "@/components/chat-form";
import { ChatHeader } from "@/components/chat-header";
import { Companion, Message } from "@/generated/prisma";
import { useRouter } from "next/navigation";

interface ChatClientProps {
    companion: Companion & {
        messages: Message[];
        _count: {
            messages: number;
        }
    };
};

export const ChatClient = ({ companion }: ChatClientProps) => {
    // const router = useRouter();

    return (
        <div>
            <ChatHeader companion={companion} />
            {/* <ChatMessages
                companion={companion}
                isLoading={isLoading}
                messages={messages}
            />
            <ChatForm
                isLoading={isLoading}
                input={input}
                handleInputChange={handleInputChange}
                onSubmit={onSubmit}
            /> */}
        </div>
    )
}