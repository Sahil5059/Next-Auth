//imports
"use server";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenbyToken } from "@/data/verificationToken";

export const newVerification = async ( token: string ) => {
    const existingToken = await getVerificationTokenbyToken( token );

    if( !existingToken ) {
        return { error: "Token does not exist!" }
    }

    const hasExpired = new Date( existingToken.expires ) < new Date();

    if( hasExpired ) {
        return { error: "Token has expired!" }
    }

    const exisitngUser = await getUserByEmail( existingToken.email );

    if ( !exisitngUser ) {
        return { error: "Email does not exist!" }
    }
    
    await db.user.update({
        where: {
            id: exisitngUser.id,
        },
        data: {
            emailVerified: new Date(),
            email: existingToken.email, //this might not make sense now, but it will make sense when we will code the "update user email" part in the "settings" page
        },
    });

    await db.verificationToken.delete({
        where: {
            id: existingToken.id,
        }
    });

    return { success: "Email verified!" }
}