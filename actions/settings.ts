//imports
"use server";
import * as z from "zod";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { SettingsSchema } from "@/schemas";
import { currentUser } from "@/lib/auth";
import { getUserByEmail, getUserById } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const settings = async ( values: z.infer< typeof SettingsSchema >) => {
    const user = await currentUser();

    if ( !user ) {
        return { error: "Unauthorized" }
    }

    const dbUser = await getUserById( user.id );

    if ( !dbUser ) {
        return { error: "Unauthorized" }
    }

    if ( user.isOAuth ) {
        //we cannot allow OAuth users to update the following data
        values.email = undefined;
        values.password = undefined;
        values.newPassword = undefined;
        values.isTwoFactorEnabled = undefined;
    }

    if ( values.email && values.email !== user.email ) {
        const exisitngUser = await getUserByEmail( values.email );

        if ( exisitngUser && exisitngUser.id !== user.id ) {
            return { error: "Email already exists in another user!" }
        }

        const verificationToken  = await generateVerificationToken( values.email );

        await sendVerificationEmail(
            verificationToken.email,
            verificationToken.token,
        );

        return { success: "Verification email sent!" }
    }

    if ( values.password && values.newPassword && dbUser.password ) {
        const passwordsMatch = await bcrypt.compare(
            values.password,
            dbUser.password,
        );

        if ( !passwordsMatch ) {
            return { error: "Incorrect Password!" }
        }

        const hashedPassword = await bcrypt.hash( values.newPassword, 10 );
        values.password = hashedPassword;
        values.newPassword = undefined;
    }

    await db.user.update({
        where: {
            id: dbUser.id,
        },
        data: {
            ...values,
        },
    });

    return { success: "Settings Updated!" }
}