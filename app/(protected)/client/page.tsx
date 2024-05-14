//imports
"use client";
import { UserInfo } from "@/components/UserInfo";
import { useCurrrentUser } from "@/hooks/useCurrentUser";

const ClientPage = () => {
    const user = useCurrrentUser();

    return (
        <UserInfo 
            label="Client Component"
            user = {user}
        />
    )
}

export default ClientPage;