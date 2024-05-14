//imports
"use client";
import { UserButton } from "@/components/auth/UserButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Navbar = () => {
    const pathname = usePathname();

    return (
        <nav className="sm:bg-secondary flex justify-between items-center sm:p-4 rounded-xl w-[350px] sm:w-[600px] shadow-sm">
            <div className="flex sm:gap-x-2">
                <Button
                    asChild
                    variant={pathname === "/server" ? "default" : "outline"}
                >
                    <Link href="/server">
                        Server
                    </Link>
                </Button>
                <Button
                    asChild
                    variant={pathname === "/client" ? "default" : "outline"}
                >
                    <Link href="/client">
                        Client
                    </Link>
                </Button>
                <Button
                    asChild
                    variant={pathname === "/admin" ? "default" : "outline"}
                >
                    <Link href="/admin">
                        Admin
                    </Link>
                </Button>
                <Button
                    asChild
                    variant={pathname === "/settings" ? "default" : "outline"}
                >
                    <Link href="/settings">
                        Settings
                    </Link>
                </Button>
            </div>
            <UserButton />
        </nav>
    )
}