import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yaikidiqvtxiqtrawvgf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaWtpZGlxdnR4aXF0cmF3dmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MDI3MzcsImV4cCI6MjA1OTI3ODczN30.z2gZvFpA5HMIODCpjXJFNX0amE3V5MqAgJSrIr7jS1Y";
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchActiveOrders(limit = 100) {
  const { data, error } = await supabase
    .from("pending_orders")
    .select("order_id")
    .eq("is_active", true)
    .order("order_id", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("❌ Supabase error:", error.message);
    return;
  }

  console.log("✅ Active Orders:");
  data.forEach(row => console.log(`- Order ID: ${row.order_id}`));
}

fetchActiveOrders();
