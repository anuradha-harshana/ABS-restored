import Image from "next/image";
import AuthFrom from "./components/Auth/AuthFrom";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <AuthFrom />
    </div>
  );
}
