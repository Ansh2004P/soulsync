"use client";

import { BeatLoader } from "react-spinners";
import { cn } from "@/lib/utils";
import { BotAvatar } from "./bot-avatar";
import { Button } from "./ui/button";
import { Copy } from "lucide-react";
import { useTheme } from "next-themes";
import { UserAvatar } from "./user-avatar";

export interface ChatMessageProps {
    role: "system" | "user",
    content?: string;
    isLoading?: boolean;
    src?: string;
}

export const ChatMessage = ({ role, content, isLoading, src }: ChatMessageProps) => {
    const { theme } = useTheme();

    return (
        <div className={cn(
            "group flex items-start gap-x-3 py-4 w-full",
            role === "user" && "justify-end"
        )}>
            {role !== "user" && src && <BotAvatar src={src} />}
            <div className="rounded-md px-4 py-2 max-w-sm text-sm bg-primary/10">
                {isLoading
                    ? <BeatLoader color={theme === "light" ? "black" : "white"} size={5} />
                    : content
                }
            </div>
            {role === "user" && <UserAvatar />}
            {role !== "user" && !isLoading && (
                <Button
                    // onClick={}
                    className="opacity-0 group-hover:opacity-100 transition"
                    size="icon"
                    variant="ghost"
                >
                    <Copy className="w-4 h-4" />
                </Button>
            )}
        </div>
    );
}