//imports
"use client";
import { signOut } from "next-auth/react";

interface LogoutButtonProps {
    children?: React.ReactNode;
}

export const LogoutButton = ({ children }: LogoutButtonProps ) => {
    const handleLogout = () => {
        signOut();
    }

    return (
        <span
            className="cursor-pointer"
            onClick={handleLogout}
        >
            {children}
        </span>
    )
}