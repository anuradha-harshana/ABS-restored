import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getVariables() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string

    if(!supabaseUrl || !supabaseKey) {
        throw new Error(
            "Missing auth keys"
        )
    }

    return {supabaseUrl, supabaseKey}

}   


export async function createSupabaseServerClient() {
    const {supabaseUrl, supabaseKey} = getVariables();
    const cookieStore = await cookies(); 

    return createServerClient (supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => 
                        cookieStore.set(name, value, options)
                    );;

                } catch (error) {
                    console.log(error)
                }
            }
        }
    });
}

