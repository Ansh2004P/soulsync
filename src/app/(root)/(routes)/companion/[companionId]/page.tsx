import { CompanionForm } from "@/app/(root)/(routes)/companion/[companionId]/components/companion-form";
import { getCurrentUser } from "@/hooks/use-currenUser";
import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";

interface CompanionPageProps {
    params: Promise<{ companionId: string }>; // mark params as async
}

const CompanionIdPage = async ({ params }: CompanionPageProps) => {
    const { companionId } = await params; // ✅ await params here

    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) redirect("/");

    // console.log("CompanionIdPage userId:", user);

    const companion = await prismadb.companion.findUnique({
        where: {
            id: companionId,
            userId,
        }
    });

    const categories = await prismadb.category.findMany();

    return (
        <CompanionForm
            initData={companion}
            categories={categories}
        />
    );
};

export default CompanionIdPage;
