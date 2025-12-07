"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

// Lazy Init Admin Client
function getAdminDb() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function getCustomers() {
    const supabaseAdmin = getAdminDb()
    const { data, error } = await supabaseAdmin
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false })

    if (error) throw error
    return data
}

export async function createCustomer(formData: FormData) {
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const notes = formData.get("notes") as string
    const cedula = formData.get("cedula") as string

    if (!fullName) {
        return { error: "Name is required" }
    }

    try {
        const supabaseAdmin = getAdminDb()

        const { error } = await supabaseAdmin
            .from("customers")
            .insert({
                full_name: fullName,
                cedula: cedula || null, // Add to DB
                email: email || null,
                phone: phone || null,
                notes: notes || null,
            })
            .select() // Force return of data to confirm write

        if (error) throw error

        revalidatePath("/dashboard/customers")
        return { success: true }
    } catch (error: any) {
        console.error("Error creating customer:", error)
        return { error: error.message }
    }
}

export async function updateCustomer(id: string, formData: FormData) {
    // Logic for update would go here
    return { success: true }
}

export async function deleteCustomer(id: string) {
    try {
        const supabaseAdmin = getAdminDb()
        const { error } = await supabaseAdmin
            .from("customers")
            .delete()
            .eq("id", id)

        if (error) throw error

        revalidatePath("/dashboard/customers")
        return { success: true }
    } catch (error: any) {
        console.error("Error deleting customer:", error)
        return { error: error.message }
    }
}
