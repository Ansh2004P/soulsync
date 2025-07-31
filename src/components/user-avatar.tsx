"use client";

import { useCurrentUser } from "@/hooks/getCurrentUserClient";
import { Avatar, AvatarImage } from "./ui/avatar";
import { redirect } from "next/dist/client/components/navigation";
import { Loader2 } from "lucide-react";
import { AvatarFallback } from "@radix-ui/react-avatar";

export const UserAvatar = () => {
    const { user, error, isLoading } = useCurrentUser();
    if (isLoading) {
        return (
            <Avatar className="h-12 w-12 flex items-center justify-center">
                <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
            </Avatar>
        );
    }
    

    if (error || !user) {
        console.error("Error fetching user:", error);
        return (
            <Avatar className="h-12 w-12">
                <AvatarFallback>?</AvatarFallback>
            </Avatar>
        );
    }
    const { picture } = user;
    return (
        <Avatar className="h-12 w-12">
            <AvatarImage src={picture} alt={user?.given_name} />
        </Avatar>
    )
}