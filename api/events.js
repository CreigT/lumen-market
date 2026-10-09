const crypto = require("crypto");

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
