//imports
"use client";
import { useCurentRole } from "@/hooks/useCurrentRole";
import { UserRole } from "@prisma/client";
import { FormError } from "../FormError";

interface RoleGateProps {
    children: React.ReactNode;
    allowedRole: UserRole;
}

export const RoleGate = ({ children, allowedRole }: RoleGateProps ) => {
    const role = useCurentRole();

    if ( role !== allowedRole ) {
        return (
            <FormError message="You do not have the permission to view this content!" />
        )
    }

    return (
        <>
            {children}
        </>
    )
}