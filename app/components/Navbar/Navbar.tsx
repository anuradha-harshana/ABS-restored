"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "../../lib/auth/auth-service";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/"); // redirect to login/home
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="font-bold text-3xl">
        <h3>Avant</h3>
      </div>
      <div className="flex gap-4">
        {user ? (
          <>
            <div className="flex p-3 items-center justify-center">
              <a className="px-4 text-lg hover:text-blue-500" href="/dashboard">Registration</a>
              <a className="px-4 text-lg hover:text-blue-500" href="/Customer">Customer</a>
              <a className="px-4 text-lg hover:text-blue-500" href="/Company">Company</a>
            </div>
            <Button variant="destructive" size="lg" className="hover:bg-red-500 hover:text-white cursor-pointer" onClick={handleSignOut}>
              Sign Out
            </Button>
          </>
        ) : (
          <>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
