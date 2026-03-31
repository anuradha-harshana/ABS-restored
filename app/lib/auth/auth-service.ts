import { getSupabaseBrowserClient } from "../supabase/browser-client";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

const supabase = getSupabaseBrowserClient();

export const signIn = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => supabase.auth.signOut();

export const onAuthChange = (callback: (event: AuthChangeEvent, session: Session | null) => void) =>
  supabase.auth.onAuthStateChange(callback);
