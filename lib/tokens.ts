//imports
import { getVerificationTokenbyEmail } from "@/data/verificationToken";
import { db } from "./db";
import { v4 as uuidv4 } from "uuid";
import { getPasswordResetTokenByToken } from "@/data/passwordResetToken";
import crypto from "crypto";
import { getTwoFactorTokenByEmail } from "@/data/twoFactorToken";

export const generateVerificationToken = async ( email: string ) => {
    //first open the terminal and type: "npm i uuid" & then "npm i --save-dev @types/uuid" to ensure that the tokn is always unique
    const token = uuidv4();
    const expires = new Date( new Date().getTime() + 3600 * 1000 ); //basically, the expire time is set to 1 hour duration
    const existingToken = await getVerificationTokenbyEmail( email );

    if ( existingToken ) {
        await db.verificationToken.delete({
            where: {
                id: existingToken.id,
            },
        });
    }

    const verificationToken = await db.verificationToken.create({
        data: {
            email,
            token,
            expires,
        }
    });

    return verificationToken;
}

export const generatePasswordResetToken = async ( email: string ) => {
    const token = uuidv4();
    const expires = new Date( new Date().getTime() + 3600 * 1000 );
    const existingToken = await getPasswordResetTokenByToken( email );

    if ( existingToken ) {
        await db.passwordResetToken.delete({
            where: {
                id: existingToken.id,
            },
        });
    }

    const passwordResetToken = await db.passwordResetToken.create({
        data: {
            email,
            token,
            expires,
        }
    });

    return passwordResetToken;
}

export const generateTwoFactorToken = async ( email: string ) => {
    const token = crypto.randomInt( 100000, 1000000 ).toString();
    const expires = new Date( new Date().getTime() + 5 * 60 * 1000 );
    const exisitngToken = await getTwoFactorTokenByEmail( email );

    if ( exisitngToken ) {
        await db.twoFactorToken.delete({
            where: {
                id: exisitngToken.id,
            }
        });
    }

    const twoFactorToken = await db.twoFactorToken.create({
        data: {
            email,
            token,
            expires,
        }
    });

    return twoFactorToken;
}