import { getCurrentUser } from "@/hooks/use-currenUser";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const user = await getCurrentUser();
        const { src, name, description, instructions, seed, catrgoryId } = body;

        if (!user || !user.id || !user.given_name) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!src || !name || !description || !instructions || !seed || !catrgoryId) {
            return new NextResponse("All fields are required", { status: 400 });
        }

        const companion = await prismadb.companion.create({
            data: {
                catrgoryId,
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

// CompanionIdPage userId: {
//   id: ,
//   email: ,
//   family_name: ,
//   given_name: ,
//   picture: ,
//   properties: {}
// }