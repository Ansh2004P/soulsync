"use client";

import { cn } from "@/lib/utils";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import { Poppins } from "next/font/google";
import Link from "next/link";

const font = Poppins({ weight: "600", subsets: ["latin"] });


export const Navbar = () => {
    return (
        <nav className="fixed w-full z-50 flex justify-between items-center py-2 px-4 h-16 border-b border-primary/10 bg-secondary">
            <div className="flex items-center">
                <Link href="/" className={cn("hidden md:block text-xl md:3xl font-bold test-primary", font.className)}>
                    <h1>SoulSync</h1>
                </Link>
            </div>
            <div className="flex items-center gap-x-3">

            </div>

            <LogoutLink className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition">
                Logout
            </LogoutLink>
        </nav>
    );
}
