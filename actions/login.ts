//imports
"use server"; //this will ensure taht our server code is never bundled with our client code
import * as z from "zod";
import { signIn } from "@/auth"
import { LoginSchema } from "@/schemas";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { generateTwoFactorToken, generateVerificationToken } from "@/lib/tokens";
import { getUserByEmail } from "@/data/user";
import { sendTwoFactorTokenEmail, sendVerificationEmail } from "@/lib/mail";
import { getTwoFactorTokenByEmail } from "@/data/twoFactorToken";
import { db } from "@/lib/db";
import { getTwoFactorConfirmationByUserId } from "@/data/twoFactorConfirmation";

export const login = async ( values: z.infer< typeof LoginSchema >, callbackUrl: string | null ) => {
    const validatedFields = LoginSchema.safeParse( values );

    if( !validatedFields.success ) {
        return { error: "Invalid Fields!" }
    }

    const { email, password, code } = validatedFields.data;
    const exisitngUser = await getUserByEmail( email );

    if ( !exisitngUser || !exisitngUser.email || !exisitngUser.password ) {
        return { error: "Email does not exist!" }
    }

    if ( !exisitngUser.emailVerified ) {
        const verificationToken = await generateVerificationToken( exisitngUser.email );

        await sendVerificationEmail(
            verificationToken.email,
            verificationToken.token,
        );

        return { success: "Confirmation email sent!" }
    }

    if ( exisitngUser.isTwoFactorEnabled && exisitngUser.email ) {
        if ( code ) {
            const twoFactorToken = await getTwoFactorTokenByEmail( exisitngUser.email );

            if ( !twoFactorToken ) {
                return { error: "Invalid code!" }
            }

            if ( twoFactorToken.token !== code ) {
                return { error: "Invalid code!" }
            }

            const hasExpired = new Date( twoFactorToken.expires ) < new Date();

            if ( hasExpired ) {
                return { error: "Code expired!" }
            }

            await db.twoFactorToken.delete({
                where: {
                    id: twoFactorToken.id,
                }
            });

            const existingConfirmation = await getTwoFactorConfirmationByUserId( exisitngUser.id );

            if ( existingConfirmation ) {
                await db.twoFactorConfirmation.delete({
                    where: {
                        id: existingConfirmation.id,
                    },
                });
            }

            await db.twoFactorConfirmation.create({
                data: {
                    userId: exisitngUser.id,
                }
            });
        } else {
            const twoFactorToken = await generateTwoFactorToken( exisitngUser.email );

            await sendTwoFactorTokenEmail(
                twoFactorToken.email,
                twoFactorToken.token,
            );

            return { twoFactor: true }
        }
    }

    try {
        await signIn( "credentials", {
            email,
            password,
            redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
        });
        
    } catch ( error ) {
        if ( error instanceof AuthError ) {
            switch ( error.type ) {
                case "CredentialsSignin":
                    return { error: "Invalid Credentials" }
                default :
                    return { error: "Something went wrong!" }
            }
        }

        throw error; //explaination- 2:46:20 to 2:46:50
    }
}