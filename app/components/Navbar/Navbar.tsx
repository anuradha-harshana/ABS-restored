"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "../../lib/auth/auth-service";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "../../assets/avantbg.png";

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
       <Image 
          src={Logo} 
          alt="ABS Logo" 
          width={70} 
          height={70} 
          className="inline-block ml-6 mr-6 scale-200" 
       />
      </div>
      <div className="flex gap-4">
        {user ? (
          <>
            <div className="flex p-3 items-center justify-center">
              <a className="px-4 text-lg hover:text-blue-500" href="/dashboard">Registration</a>
              <a className="px-4 text-lg hover:text-blue-500" href="/Customer">Customer</a>
              <a className="px-4 text-lg hover:text-blue-500" href="/Company">Company</a>
              <Button variant="destructive" size="lg" className="hover:bg-red-500 hover:text-white cursor-pointer" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
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
