import express from "express";
import { ethers } from "ethers";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const app = express();
const port = 3000;

const supabaseUrl = "https://yaikidiqvtxiqtrawvgf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaWtpZGlxdnR4aXF0cmF3dmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MDI3MzcsImV4cCI6MjA1OTI3ODczN30.z2gZvFpA5HMIODCpjXJFNX0amE3V5MqAgJSrIr7jS1Y";
const supabase = createClient(supabaseUrl, supabaseKey);

const RPC = "https://testnet.dplabs-internal.com";
const PRIVATE_KEY = "e12f9b03327a875c2d5bf9b40a75cd2effeed46ea508ee595c6bc708c386da8c";
const CONTRACT_ADDRESS = "0xbb24da1f6aaa4b0cb3ff9ae971576790bb65673c";

const provider = new ethers.providers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "orderId", "type": "uint256" },
      { "internalType": "bytes", "name": "proof", "type": "bytes" }
    ],
    "name": "executePendingOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

app.get("/execute-db", async (req, res) => {
  const limit = parseInt(req.query.limit);
  if (isNaN(limit) || limit <= 0) {
    return res.status(400).json({ error: "Invalid 'limit' parameter" });
  }

  const { data: rows, error } = await supabase
    .from("pending_orders")
    .select("order_id")
    .eq("is_active", true)
    .order("order_id", { ascending: true })
    .limit(limit);

  if (error) return res.status(500).json({ error: "Supabase error" });

  const results = [];

  for (const row of rows) {
    const i = row.order_id;
    try {
      const proofRes = await fetch("https://multiproof-production.up.railway.app/proof");
      const proofData = await proofRes.json();
      const proof = proofData.proof;

      if (!proof) {
        results.push({ orderId: i, status: "failed", reason: "no proof" });
        continue;
      }

      const tx = await contract.executePendingOrder(i, proof);
      await tx.wait();

      await supabase.from("pending_orders").update({ is_active: false }).eq("order_id", i);
      results.push({ orderId: i, status: "executed", txHash: tx.hash });
    } catch (err) {
      results.push({ orderId: i, status: "error", reason: err.reason || err.message });
    }
  }

  res.json({ total: results.length, results });
});

app.listen(port, () => {
  console.log(`🟢 API listening on port ${port}`);
});
