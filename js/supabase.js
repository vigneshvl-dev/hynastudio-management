/**
 * HYNAOS — Supabase Client Initialization & Authentication Helper
 * Hyna Studio Management System
 */

// Replace these placeholders with your actual Supabase Project URL and Anon Public Key
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

// Mock Fallback Database Profiles for seamless local testing without Supabase configuration
const DEMO_PROFILES = [
  {
    id: "admin-uuid-001",
    email: "team.hynastudio@gmail.com",
    role: "admin",
    full_name: "Hyna Admin",
    employee_id: "ADM-101",
    department: "Executive Management",
    position: "System Administrator",
    status: "active"
  },
  {
    id: "employee-uuid-002",
    email: "employee@hynastudio.com",
    role: "employee",
    full_name: "Alex Vance",
    employee_id: "EMP-204",
    department: "Engineering",
    position: "Senior Developer",
    status: "active"
  }
];

let supabaseClient = null;
let isDemoMode = false;

// Initialize Supabase Client
function initSupabase() {
  if (
    typeof window.supabase !== "undefined" &&
    SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
    SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY"
  ) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      isDemoMode = false;
      console.log("⚡ HYNAOS: Supabase client connected.");
    } catch (err) {
      console.warn("⚠️ HYNAOS: Failed to initialize Supabase client. Fallback to Demo Mode.", err);
      isDemoMode = true;
    }
  } else {
    isDemoMode = true;
    console.log("💡 HYNAOS Running in Demo Mode (Default test accounts active).");
  }
}

// Call initialization immediately
initSupabase();

window.HYNAOS_SUPABASE = {
  getClient: () => supabaseClient,
  isDemoMode: () => isDemoMode,
  demoProfiles: DEMO_PROFILES
};
