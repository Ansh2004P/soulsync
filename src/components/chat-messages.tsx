"use client";

import { Companion } from "@prisma/client";
import { ComponentRef, useEffect, useRef, useState } from "react";
import { ChatMessage, ChatMessageProps } from "./chat-message";
import { UserAvatar } from "./user-avatar";

export interface ChatMessagesProps {
    messages: ChatMessageProps[];
    isLoading: boolean;
    companion: Companion;
};

export const ChatMessages = ({
    messages = [],
    isLoading,
    companion,
}: ChatMessagesProps) => {
    const scrollRef = useRef<ComponentRef<"div">>(null);
    const [fakeLoading, setFakeLoading] = useState(messages.length === 0 ? true : false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setFakeLoading(false);
        }, 1000);

        return () => {
            clearTimeout(timeout);
        }
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth"});
    }, [messages.length]);

    return (
        <div className="flex-1 overflow-y-auto pr-4">
            <ChatMessage
                isLoading={fakeLoading}
                src={companion.src}
                role="system"
                content={`Hello, I am ${companion.name}, ${companion.description}, How can I assist you today?`}
            />
            {messages.map((message, index) => (
                <ChatMessage
                    key={index}
                    src={companion.src}
                    content={message.content}
                    role={message.role}
                />
            ))}
            {isLoading && (
                <ChatMessage
                    src={companion.src}
                    role="system"
                    isLoading
                />
            )}
            <div ref={scrollRef} />
        </div>
    );
};