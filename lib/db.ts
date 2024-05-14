//imports
import { PrismaClient } from "@prisma/client";

//first, open the terminal and type: "npm i -D prisma" and & "npm i @prisma/client" & then "npm i @auth/prisma-adapter"
//explaination - 1:42:20 to 1:43:35

declare global {
    var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();
if ( process.env.NODE_ENV !== "production" ) globalThis.prisma = db;

//now, open the terminal and type: "npx prisma init"
//now, watch- 1:44:25 to 1:57:15