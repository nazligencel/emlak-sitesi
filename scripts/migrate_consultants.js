
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv to read from the root .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
console.log("Loading .env from:", envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env:", result.error);
} else {
    // console.log("Parsed .env keys:", Object.keys(result.parsed));
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;
console.log("URL:", supabaseUrl ? "Found" : "Missing");
console.log("Key:", supabaseKey ? "Found" : "Missing");

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_KEY in .env");
    // console.log("Current env:", process.env);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateConsultants() {
    console.log("Starting consultant update: changing Mesut (1) to Mehmet (2)...");

    const { data, error } = await supabase
        .from('listings')
        .update({ consultant_id: 2 })
        .eq('consultant_id', 1)
        .select();

    if (error) {
        console.error("Error updating listings:", error);
    } else {
        console.log(`Successfully updated ${data.length} listings from Mesut to Mehmet.`);
    }
}

updateConsultants();
