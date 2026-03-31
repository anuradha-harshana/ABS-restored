"use client"

import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

type SupabaseSchema = Record<string, never>;

let client: SupabaseClient<SupabaseSchema> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<SupabaseSchema> {
    if(client) {
        return client;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;

    if(!supabaseUrl || !supabaseKey) {
        throw new Error (
            "Missing Auth Keys"
        );
    }

    client = createBrowserClient<SupabaseSchema>(supabaseUrl, supabaseKey)
    return client;
} 