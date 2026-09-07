/**
 * HYNAOS — Supabase Client Initialization & Authentication Helper
 * Hyna Studio Management System
 */

// Replace these placeholders with your actual Supabase Project URL and Anon Public Key
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

// Official Hyna Studio Team Database Profiles & Login Credentials
const DEMO_PROFILES = [
  {
    id: "EMP-001",
    employee_id: "EMP-001",
    email: "team.hynastudio@gmail.com",
    password: "Hyna123@",
    role: "admin",
    full_name: "Vignesh",
    department: "Executive",
    position: "Founder & CEO",
    status: "active"
  },
  {
    id: "EMP-002",
    employee_id: "EMP-002",
    email: "jashwin@hynastudio.com",
    password: "Hyna123@",
    role: "employee",
    full_name: "Jashwin J",
    department: "Executive",
    position: "Co-Founder & COO",
    status: "active"
  },
  {
    id: "EMP-003",
    employee_id: "EMP-003",
    email: "dharshan@hynastudio.com",
    password: "Hyna123@",
    role: "employee",
    full_name: "Dharshan J M",
    department: "Executive",
    position: "Co-Founder & CTO",
    status: "active"
  },
  {
    id: "EMP-004",
    employee_id: "EMP-004",
    email: "linciya@hynastudio.com",
    password: "Hyna123@",
    role: "employee",
    full_name: "Linciya",
    department: "Marketing",
    position: "CMO — Chief Marketing Officer",
    status: "active"
  },
  {
    id: "EMP-005",
    employee_id: "EMP-005",
    email: "cso@hynastudio.com",
    password: "Hyna123@",
    role: "employee",
    full_name: "New Appointment",
    department: "Strategy",
    position: "CSO — Chief Strategy Officer",
    status: "active"
  },
  {
    id: "EMP-006",
    employee_id: "EMP-006",
    email: "zarif@hynastudio.com",
    password: "Hyna123@",
    role: "employee",
    full_name: "Muhammed Zarif",
    department: "Growth",
    position: "Director & Growth Manager",
    status: "active"
  },
  {
    id: "EMP-007",
    employee_id: "EMP-007",
    email: "arshiya@hynastudio.com",
    password: "Hyna123@",
    role: "employee",
    full_name: "Mohamed Arshiya",
    department: "Product",
    position: "CPO — Chief Product Officer",
    status: "active"
  },
  {
    id: "EMP-008",
    employee_id: "EMP-008",
    email: "asthamil@hynastudio.com",
    password: "Hyna123@",
    role: "employee",
    full_name: "Asthamil",
    department: "Human Resources",
    position: "HR Manager",
    status: "active"
  },
  {
    id: "EMP-009",
    employee_id: "EMP-009",
    email: "tharun@hynastudio.com",
    password: "Hyna123@",
    role: "employee",
    full_name: "Tharun Krishna",
    department: "Design",
    position: "Designer",
    status: "active"
  },
  {
    id: "EMP-010",
    employee_id: "EMP-010",
    email: "akshaya@hynastudio.com",
    password: "Hyna123@",
    role: "employee",
    full_name: "Akshaya",
    department: "Engineering",
    position: "DevOps Engineer",
    status: "active"
  },
  {
    id: "EMP-011",
    employee_id: "EMP-011",
    email: "thivan@hynastudio.com",
    password: "Hyna123@",
    role: "employee",
    full_name: "Thivan",
    department: "Engineering",
    position: "Full Stack Developer",
    status: "active"
  },
  {
    id: "EMP-012",
    employee_id: "EMP-012",
    email: "rohit@hynastudio.com",
    password: "Hyna123@",
    role: "employee",
    full_name: "Rohit",
    department: "Engineering",
    position: "Full Stack Developer",
    status: "active"
  },
  {
    id: "EMP-013",
    employee_id: "EMP-013",
    email: "anzar@hynastudio.com",
    password: "Hyna123@",
    role: "employee",
    full_name: "Anzarutheen",
    department: "Engineering",
    position: "Full Stack Developer",
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
