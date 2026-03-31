"use client";

import { useState } from "react";
import { signIn } from "../../lib/auth/auth-service"
import { useRouter } from "next/navigation";

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn(email, password);

    if (error){
      alert(error.message);
    }else {
      alert("Succesfully Loged In")
    };

    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <legend className="text-center text-4xl font-bold">Sign In</legend>  
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border rounded"
      />
      <button type="submit" className="p-2 bg-blue-500 text-white rounded">
        Sign In
      </button>
    </form>
  );
};

export default AuthForm;
