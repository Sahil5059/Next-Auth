//imports
import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes } from "@/routes";

const { auth } = NextAuth( authConfig );

export default auth(( req ) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth; //coverted "req.auth" into boolean using "!!"
    const isApiAuthRoute = nextUrl.pathname.startsWith( apiAuthPrefix );
    const isPublicRoute = publicRoutes.includes( nextUrl.pathname );
    const isAuthRoute = authRoutes.includes( nextUrl.pathname );

    //note that the order matters in the below "if-statements". So, follow the order below

    if ( isApiAuthRoute ) {
        return undefined; //it basically means "just allow this route please"
    }

    if ( isAuthRoute ) {
        if( isLoggedIn ) {
            return Response.redirect( new URL( DEFAULT_LOGIN_REDIRECT, nextUrl )); //nextUrl makes "DEFAULT_LOGIN_REDIRECT" as  an absolute URL
        }
        return undefined;
    }

    if ( !isLoggedIn && !isPublicRoute ) {
        let callbackUrl = nextUrl.pathname;

        if ( nextUrl.search ) {
            callbackUrl += nextUrl.search;
        }

        const encodedCallbackUrl = encodeURIComponent( callbackUrl );
        return Response.redirect( new URL( `/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl ));
    }

    return undefined; //for any other route
});

export const config = {
    matcher: [ "/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)" ], //routes put here will invoke the defualt middleware (above) when accessed & currently, all routes are inciuded except specefic next static files and next images
}