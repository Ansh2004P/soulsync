import { getCurrentUser } from "@/hooks/use-currenUser";
import { ChatClient } from "./components/ChatClient";
import { redirect } from "next/dist/client/components/navigation";
import prismadb from "@/lib/prismadb";
interface ChatIdProps {
    params: Promise<{ chatId: string }>
}

const ChatIdPage = async ({ params }: ChatIdProps) => {

    const { chatId } = await params;
    const user = await getCurrentUser();
    const userId = user.id;

    if (!user) {
        redirect("/");
    }
    const companion = await prismadb.companion.findUnique({
        where: {
            id: chatId,
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: "asc"
                },
                where: {
                    userId: userId,
                },
            },
            _count: {
                select: {
                    messages: true,
                }
            }
        }
    });

    if (!companion) {
        return redirect("/");
    }
    return (
        <ChatClient companion={companion} />
    )
}

export default ChatIdPage;