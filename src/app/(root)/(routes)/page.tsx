export const dynamic = "force-dynamic"; 

import { Categories } from "@/components/categories";
import { Companions } from "@/components/companions";
import SearchInput from "@/components/search-input";
import { getCurrentUser } from "@/hooks/use-currenUser";
import prismadb from "@/lib/prismadb";

interface RootPageProps {
    searchParams: Promise<{
        categoryId: string;
        name: string;
    }>;
};

const RootPage = async ({
    searchParams
}: RootPageProps) => {

    const user = await getCurrentUser();
    const defaultUserId = process.env.DEFAULT_USER_ID;
    const params = await searchParams;
    console.log("Default User ID:", defaultUserId);
    const data = await prismadb.companion.findMany({
        where: {
            AND: [
                {
                    OR: [
                        { userId: user?.id },
                        { userId: defaultUserId }
                    ]
                },
                {
                    categoryId: params.categoryId || undefined,
                }
            ],
            name: {
                contains: params.name,
                mode: "insensitive",
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            _count: {
                select: {
                    messages: {
                        where: { userId: user?.id },
                    }
                }
            }
        },
    });

    const categories = await prismadb.category.findMany();

    return (
        <div className="h-full p-4 space-y-2">
            <SearchInput />
            <Categories data={categories} />
            <Companions data={data} />
        </div>
    )
}

export default RootPage;

