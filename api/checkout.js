const PRICE_ENV = {
  "TOTE-OAT": "STRIPE_PRICE_TOTE",
  "CARAFE-SAND": "STRIPE_PRICE_CARAFE",
  "THROW-COPPER": "STRIPE_PRICE_THROW",
  "NOTES-SAGE": "STRIPE_PRICE_NOTES",
  household: "STRIPE_PRICE_HOUSEHOLD",
  atelier: "STRIPE_PRICE_ATELIER"
};

function readJson(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === "object") return resolve(req.body);
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; });
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch (err) { reject(err); }
    });
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const body = await readJson(req);
  const email = String(body.email || "");
  const key = body.plan || body.sku;
  if (!email.includes("@")) return res.status(400).json({ error: "A real email is required." });
  if (!key || !PRICE_ENV[key]) return res.status(400).json({ error: "Choose a product or a plan." });

  const base = process.env.PUBLIC_BASE_URL || `https://${req.headers.host}`;
  const priceId = process.env[PRICE_ENV[key]];
  const secret = process.env.STRIPE_SECRET_KEY;

  if (!secret || !priceId) {
    const status = body.plan ? "demo" : "demo";
    const q = new URLSearchParams({ status, sku: body.sku || "", plan: body.plan || "" });
    return res.status(200).json({ mode: "demo", url: `${base}/checkout.html?${q.toString()}` });
  }

  const mode = body.plan ? "subscription" : "payment";
  const params = new URLSearchParams();
  params.set("mode", mode);
  params.set("customer_email", email);
  params.set("success_url", `${base}/checkout.html?status=paid&plan=${body.plan || ""}&sku=${body.sku || ""}`);
  params.set("cancel_url", `${base}/checkout.html?status=cancelled`);
  params.set("line_items[0][price]", priceId);
  params.set("line_items[0][quantity]", "1");
  params.set("metadata[sku]", body.sku || "");
  params.set("metadata[plan]", body.plan || "");

  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/x-www-form-urlencoded"
    },
    body: params
  });
  const session = await stripeRes.json();
  if (!stripeRes.ok) return res.status(502).json({ error: session.error?.message || "Stripe refused the session." });
  res.status(200).json({ mode: "live", url: session.url });
};
