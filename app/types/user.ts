import { User } from "@supabase/supabase-js";

export interface AuthProps {
    user: User | null
}

export type Mode = "signup" | "signin"