const { createClient } = require("@supabase/supabase-js");

// Use the environment variables
const supabaseUrl = "https://hdollzillfiutjscqiea.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkb2xsemlsbGZpdXRqc2NxaWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjk3MzksImV4cCI6MjA3MDg0NTczOX0.5BIb3Fh5UTTTc_BEzVqM47JKMJPk6HD0AbZkUTvM-W4";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testVendorProfileQuery() {
  console.log("🧪 Testing vendor profile query...");

  try {
    // First, let's check if we can connect to the database
    console.log("1. Testing basic connection...");
    const { data: connectionTest, error: connectionError } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    if (connectionError) {
      console.error(
        "❌ Connection test failed:",
        JSON.stringify(connectionError, null, 2)
      );
      return;
    }
    console.log("✅ Basic connection works");

    // Now let's try to query vendor_profiles
    console.log("2. Testing vendor_profiles query...");
    const { data, error } = await supabase
      .from("vendor_profiles")
      .select("*")
      .limit(1);

    console.log("Query result:", { data, error });

    if (error) {
      console.error(
        "❌ Vendor profiles query failed:",
        JSON.stringify(error, null, 2)
      );
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);
    } else {
      console.log("✅ Vendor profiles query succeeded:", data);
    }
  } catch (err) {
    console.error("💥 Exception occurred:", err);
  }
}

testVendorProfileQuery();
