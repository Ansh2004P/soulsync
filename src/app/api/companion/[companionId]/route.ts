import { getCurrentUser } from "@/hooks/use-currenUser";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request, { params }: { params: Promise<{ companionId: string }> }
) {
    try {
        const { companionId } = await params;
        const body = await req.json();
        const user = await getCurrentUser();
        const { src, name, description, instructions, seed, categoryId } = body;

        if (!companionId)
            return new NextResponse("Companion ID is required", { status: 400 });

        if (!user || !user.id || !user.given_name) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!src || !name || !description || !instructions || !seed || !categoryId) {
            return new NextResponse("All fields are required", { status: 400 });
        }

        const companion = await prismadb.companion.update({
            where: {
                id: companionId,
                userId: user.id
            }, data: {
                categoryId,
                userId: user.id,
                userName: user.given_name,
                src,
                name,
                description,
                instructions,
                seed,
            }
        });

        return NextResponse.json(companion);
    } catch (error) {
        console.log("[COMPANION_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
};

export async function DELETE(req: Request,
    { params }: { params: Promise<{ companionId: string }>}
) {
    try {
        const user = await getCurrentUser();
        const userId = user?.id;
        // console.log("User ID:", userId);
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { companionId } = await params;

        const companion = await prismadb.companion.delete({
            where: {
                userId,
                id: companionId
            }
        })

        return NextResponse.json({ message: "Companion deleted successfully" });
    } catch (error) {
        console.error("[COMPANION_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
};


// CompanionIdPage userId: {
//   id: ,
//   email: ,
//   family_name: ,
//   given_name: ,
//   picture: ,
//   properties: {}
// }