import { checkUser } from "@/lib/checkUser";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { LayoutDashboard, PenBox } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

const Header = async () => {
  await checkUser();
  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b">
      <nav className="container mx-auto p-4 flex items-center justify-between">
        {/** Logo */}
        <Link href="/">
          <Image
            src="/minance-logo.png"
            alt="minance logo"
            width={60}
            height={400}
            className="h-20 w-auto object-contain"
            property="true"
          />
        </Link>

        {/** Menu */}
        <div className="flex items-center space-x-4">
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600 flex items-center gap-2"
            >
              <Button variant="outline">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>

            <Link href="/transaction/create">
              <Button className="flex items-center gap-2">
                <PenBox size={18} />
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </Link>
          </SignedIn>

          <SignedIn>
            <UserButton appearance={{ elements: { avatarBox: "w-12 h-10" } }} />
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
};

export default Header;
