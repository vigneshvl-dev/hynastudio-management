import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
const targetPassword = process.env.NEW_USER_PASSWORD;

if (!supabaseUrl) {
  console.error("❌ ERROR: Missing SUPABASE_URL in .env file.");
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error("❌ ERROR: Missing SUPABASE_SERVICE_ROLE_KEY in .env file.");
  process.exit(1);
}

if (!targetPassword) {
  console.error("❌ ERROR: Missing NEW_USER_PASSWORD in .env file. Please add NEW_USER_PASSWORD=your_password to hide it.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function updatePasswords() {
  console.log("Fetching users from Supabase...");
  const { data: usersData, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (fetchError) {
    console.error("❌ Error fetching users:", fetchError);
    return;
  }

  const users = usersData.users;
  console.log(`Found ${users.length} users. Updating passwords...`);

  let successCount = 0;
  let failCount = 0;

  for (const user of users) {
    console.log(`🔄 Updating password for user: ${user.email} (ID: ${user.id})...`);
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: targetPassword }
    );

    if (updateError) {
      console.error(`❌ Failed to update password for ${user.email}:`, updateError.message);
      failCount++;
    } else {
      console.log(`✅ Successfully updated password for ${user.email}`);
      successCount++;
    }
  }

  console.log(`\n🎉 Password update complete!`);
  
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

updatePasswords();
