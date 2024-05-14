//imports
import NextAuth from "next-auth";
import { UserRole } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getUserById } from "./data/user";
import authConfig from "./auth.config";
import { db } from "./lib/db";
import { getTwoFactorConfirmationByUserId } from "./data/twoFactorConfirmation";
import { getAccountByUserId } from "./data/account";

export const {
    handlers: {
        GET,
        POST,
    },
    auth,
    signIn,
    signOut,
    unstable_update,
} = NextAuth({
    pages: {
        signIn: "/auth/login", //watch- 3:37:40 to 3:38:15
        error: "/auth/error",
    },
    events: {
        async linkAccount ({ user }) {
            await db.user.update({
                where: {
                    id:user.id,
                },
                data: {
                    emailVerified: new Date(),
                },
            });
        } //watch- 3:35:50 to 3:37:36
    },
    callbacks: {
        async signIn({ user, account }) {
            if ( account?.provider !== "credentials" ) return true; //allowing social-auth to bypass 2 step verification
            const exisitngUser = await getUserById( user.id as UserRole );
            if ( !exisitngUser?.emailVerified ) return false;
            
            if  ( exisitngUser.isTwoFactorEnabled ) {
                const twoFactorConfirmation = await getTwoFactorConfirmationByUserId( exisitngUser.id );
                if ( !twoFactorConfirmation ) return false;

                await db.twoFactorConfirmation.delete({
                    where: {
                        id: twoFactorConfirmation.id,
                    },
                });
            }

            return true;
        },
        async jwt({ token }) {
            if ( !token.sub ) return token;
            const existingUser = await getUserById( token.sub );
            if ( !existingUser ) return token;
            const exisitngAccount = await getAccountByUserId( existingUser.id );
            token.isOAuth = !!exisitngAccount;
            token.name = existingUser.name; //this code is important for displaying updated user data immediately after user has updated it.
            token.email = existingUser.email; //this code is important for displaying updated user data immediately after user has updated it.
            token.role = existingUser.role; //this code is important for displaying updated user data immediately after user has updated it.
            token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
            console.log(token)
            return token;
        },
        async session({ token, session }) {
            if (token.sub && session.user ) {
                session.user.id = token.sub; //this adds "id" in our session which previously did not exist. You can add anything you want just like this
            }

            if ( token.role && session.user ) {
                //you will get an error in next line by default, which is fixed by coding in "next-auth.d.ts"
                session.user.role = token.role as UserRole;
            }

            if ( session.user ) {
                //this code is important for displaying updated user data immediately after user has updated it.
                session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
                session.user.name = token.name;
                session.user.email = token.email as UserRole;
                session.user.isOAuth = token.isOAuth as boolean;
            }

            return session;
        },
    },
    adapter: PrismaAdapter( db ),
    session: { strategy: "jwt" },
    ...authConfig, //we created this file in the root directory because prisma does not support edge
});