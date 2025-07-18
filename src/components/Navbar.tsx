"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { DumbbellIcon, HomeIcon, UsersIcon, ZapIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

const Navbar = () => {
    const { isSignedIn } = useUser();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-md border-b border-border py-3 px-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* LOGO */}
            <Link href={"/"} className="flex mx-4 items-center gap-2">
                <div className="p-1 bg-primary/10 rounded">
                    <ZapIcon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xl font-bold font-mono">
                    yeah<span className="text-primary">buddy</span>.ai
                </span>
            </Link>

            {/* NAVIGATION */}
            <nav className="flex items-center gap-5">
                {isSignedIn ? (
                    <>
                        <Link 
                            href={"/"}
                            className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
                        >
                            <HomeIcon size={16} />
                            <span>Home</span> 
                        </Link>

                        <Link
                            href={"/generate-program"}
                            className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
                        >
                            <DumbbellIcon size={16} />
                            <span>Generate</span>
                        </Link>
                        <Link
                            href={"/profile"}
                            className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
                        >
                            <UsersIcon size={16} />
                            <span>Profile</span>
                        </Link>
                        <Button
                            asChild
                            variant="outline"
                            className="ml-2 border-primary/50 text-primary hover:text-white hover:bg-primary/10"
                        >
                            <Link href={"/generate-program"}>Get Started</Link>
                        </Button>
                        <UserButton />
                    </>
                ) : (
                    <>
                        <SignInButton>
                            <Button variant={"outline"} className="border-primary/50 text-primary hover:text-white hover:bg-primary/10">Sign In</Button>
                        </SignInButton>
                    </>
                )}
            </nav>
        </div>
    </header>
  )
}

export default Navbar