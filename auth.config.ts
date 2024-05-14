//imports
import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { LoginSchema } from "./schemas";
import { getUserByEmail } from "./data/user";
import  Github from "next-auth/providers/github";
import  Google from "next-auth/providers/google";

//we created this file because prisma odes not support edge

export default {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID, //watch - 3:24:30 to 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true, //only use for trusted OAuth providers
        }),
        Github({
            clientId: process.env.GITHUB_CLIENT_ID, //watch - 3:22:25 to 3:24:00
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }), 
        Credentials({
            async authorize( credentials ) {
                const validatedFields = LoginSchema.safeParse( credentials );
                
                if ( validatedFields.success ) {
                    const { email, password } = validatedFields.data;
                    const user = await getUserByEmail( email );
                    if ( !user || !user.password ) return null; //2nd one is for social-auth users who did not set their password

                    const passwordMatch = await bcrypt.compare(
                        password,
                        user.password,
                    );

                    if ( passwordMatch ) return user;
                }

                return null; //return null by default
            }
        })
     ],
} satisfies NextAuthConfig;