const crypto = require("crypto");

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
  res.status(200).json({ received: true });
};
