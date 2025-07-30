import { CompanionForm } from "@/components/companion-form";
import { getCurrentUser } from "@/hooks/use-currenUser";
import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";

interface CompanionPageProps {
    params: {
        companionId: string;
    };
};

const CompanionIdPage = async ({ params }: CompanionPageProps) => {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId)
        redirect("/");

    const companion = await prismadb.companion.findUnique({
        where: {
            id: params.companionId,
            userId,
        }
    });

    const categories = await prismadb.category.findMany();


    return (
        <CompanionForm
            initData={companion}
            categories={categories}
        />
    )
}

export default CompanionIdPage;