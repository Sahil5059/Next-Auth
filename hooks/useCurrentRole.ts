//imports
import { useSession } from "next-auth/react";

export const useCurentRole = () => {
    const session = useSession();
    return session.data?.user?.role;
}