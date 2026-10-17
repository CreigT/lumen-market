const crypto = require("crypto");
const { appendToSales } = require("./sheet");

function readRaw(req) {
  return new Promise((resolve, reject) => {
    if (typeof req.body === "string") return resolve(req.body);
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const raw = await readRaw(req);
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (secret) {
    const signature = req.headers["stripe-signature"] || "";
    const parts = Object.fromEntries(String(signature).split(",").map((p) => p.split("=")));
    const signed = crypto.createHmac("sha256", secret).update(`${parts.t}.${raw}`).digest("hex");
    if (!parts.v1 || signed !== parts.v1) return res.status(400).json({ error: "Bad Stripe signature." });
  }
  const event = JSON.parse(raw || "{}");
  console.log(JSON.stringify({
    layer: "finance",
    channel: "stripe",
    type: event.type,
    id: event.id,
    at: new Date().toISOString()
  }));

  const sheetId = process.env.MONEY_LOOP_SHEET_ID || "";
  if (sheetId && (event.type === "checkout.session.completed" || event.type === "charge.succeeded")) {
    const obj = event.data?.object || {};
    const amount = (obj.amount_total || obj.amount || 0) / 100;
    if (amount > 0) {
      const sku = obj.metadata?.sku || obj.metadata?.product || obj.description || "";
      await appendToSales(sheetId, {
        date: new Date().toISOString(),
        sku,
        amount,
        source: "stripe"
      });
    }
  }

  res.status(200).json({ received: true });
};
