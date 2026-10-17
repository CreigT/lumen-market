const crypto = require("crypto");
const { appendToSales } = require("./sheet");

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
  const event = {
    eventId: crypto.randomUUID(),
    type: String(body.type || "storefront.unknown"),
    source: String(body.source || "storefront"),
    at: new Date().toISOString(),
    payload: body.payload || {}
  };
  console.log(JSON.stringify({ layer: "commerce", channel: "storefront", ...event }));

  const sheetId = process.env.MONEY_LOOP_SHEET_ID || "";
  const amount = Number(event.payload?.amount || event.payload?.total || 0);
  if (sheetId && (event.type === "storefront.checkout.paid" || amount > 0)) {
    const sku = event.payload?.sku || event.payload?.product || "";
    if (amount > 0) {
      await appendToSales(sheetId, {
        date: event.at,
        sku,
        amount,
        source: event.source || "storefront"
      });
    }
  }

  if (process.env.AGENT_WEBHOOK_URL) {
    await fetch(process.env.AGENT_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-lumen-secret": process.env.AGENT_WEBHOOK_SECRET || ""
      },
      body: JSON.stringify(event)
    }).catch((err) => console.log(JSON.stringify({ layer: "commerce", error: String(err) })));
  }
  res.status(202).json({ ok: true, eventId: event.eventId });
};
