import { createSupabaseServerClient } from "../lib/supabase/server-client";
import Dashboard from "./Dashboard";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null; 

  return <Dashboard user={user} />;
}
