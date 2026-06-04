import { supabase } from "../lib/supabase";

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  });
}

export async function signUpCustomer(
  email: string,
  password: string,
  fullName: string
) {
  return supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
    options: {
      data: { full_name: fullName, role: "CUSTOMER" },
    },
  });
}

export async function signUpBusiness(
  email: string,
  password: string,
  ownerName: string
) {
  return supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
    options: {
      data: { full_name: ownerName, role: "BUSINESS" },
    },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}
