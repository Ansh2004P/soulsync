"use client";

import { ChangeEvent, ChangeEventHandler, FormEvent } from "react";
import { Input } from "./ui/input";
import { SendHorizonal } from "lucide-react";
import { Button } from "./ui/button";

interface ChatFormProps {
    input: string;
    handleInputChange: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => void;
    // onSubmit: (e: FormEvent<HTMLFormElement>, chatRequestOptions?: ChatRequestOption |undefined) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
}

export const ChatForm = ({
    input, handleInputChange, onSubmit, isLoading,
}: ChatFormProps) => {
    return (
        <form onSubmit={onSubmit} className="border-t border-primary/10 py-4 flex items-center gap-x-2">
            <Input
                disabled={isLoading}
                value={input}
                onChange={handleInputChange}
                placeholder="Type a message"
                className="rounded-lg bg-primary/10"
            />
            <Button>
                <SendHorizonal className="w-6 h-6" />
            </Button>
        </form>
    )
}