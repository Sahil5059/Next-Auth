//imports
"use server"; //this will ensure that our server code is never bundled with our client code
import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RegisterSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

//first, open the terminal and type: "npm i bcryptjs" & then "npm i -D @types/bcryptjs"

export const register = async ( values: z.infer< typeof RegisterSchema >) => {
    const validatedFields = RegisterSchema.safeParse( values );

    if ( !validatedFields.success ) {
        return { error: "Invalid Fields!" }
    }

    const { email, password, name } = validatedFields.data;
    const hashedPassword = await bcrypt.hash( password, 10 );

    const exisitngUser = await getUserByEmail( email );

    if ( exisitngUser ) {
        return { error: "Email already in use!" }
    }

    await db.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        }
    });

    const verificationToken = await generateVerificationToken( email );
    
    //watch setting up mail provider from- 4:08:00 to 4:13:00
    await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
    );

    return { success: "Confirmation Email Sent!" } //watch- 2:01:05 to 2:02:20
}