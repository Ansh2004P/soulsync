import { getCurrentUser } from "@/hooks/use-currenUser";
import { ChatClient } from "./components/ChatClient";
interface ChatIdProps {
    params: {
        chatId: string;
    }
}

const ChatIdPage =async({ params }: ChatIdProps) => {

    const user =await getCurrentUser();
    const userId = user.id;

    return (
        <ChatClient companion={companion} />
    )
}

export default ChatIdPage;