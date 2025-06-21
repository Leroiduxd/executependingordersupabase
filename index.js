import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
const port = process.env.PORT || 3000;

// Supabase config
const supabaseUrl = "https://yaikidiqvtxiqtrawvgf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaWtpZGlxdnR4aXF0cmF3dmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MDI3MzcsImV4cCI6MjA1OTI3ODczN30.z2gZvFpA5HMIODCpjXJFNX0amE3V5MqAgJSrIr7jS1Y";
const supabase = createClient(supabaseUrl, supabaseKey);

// GET /orders
app.get("/orders", async (req, res) => {
  const { data, error } = await supabase
    .from("pending_orders")
    .select("order_id")
    .eq("is_active", true)
    .order("order_id", { ascending: true });

  if (error) {
    console.error("❌ Supabase error:", error.message);
    return res.status(500).json({ error: "Database error" });
  }

  const ids = data.map((row) => row.order_id);
  res.json({ total: ids.length, ids });
});

// Start server
app.listen(port, () => {
  console.log(`🟢 API running at http://localhost:${port}/orders`);
});
