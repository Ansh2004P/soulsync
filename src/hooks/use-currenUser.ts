import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function getCurrentUser() {
    const { getUser } =getKindeServerSession();
    const user  =await getUser();

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}