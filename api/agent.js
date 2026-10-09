const fs = require("fs");
const path = require("path");

function loadConfig() {
  const raw = fs.readFileSync(path.join(process.cwd(), "config.js"), "utf8");
  const json = raw.replace(/^window\.LUMEN\s*=\s*/, "").replace(/;\s*$/, "");
  return JSON.parse(json);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === "object") return resolve(req.body);
    let raw = "";
    req.on("data", (c) => { raw += c; });
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch (err) { reject(err); }
    });
    req.on("error", reject);
  });
}

function decide(text, config) {
  const q = text.toLowerCase();
  const product = config.products.find((p) => q.includes(p.name.toLowerCase()) || q.includes(p.sku.toLowerCase()));
  if (/refund|return|money back/.test(q)) {
    const amount = Number((q.match(/\$(\d+)/) || [])[1] || 0);
    const escalate = amount > config.rules.autoRefundMax;
    return {
      agent: "Refund Agent",
      action: escalate ? "escalate" : "approve_policy",
      reply: escalate
        ? `That refund is over $${config.rules.autoRefundMax}, so the Governance Agent holds it for you. Physical goods are otherwise ${config.rules.refundDays} days.`
        : `Refund Agent: unused physical goods can come back within ${config.rules.refundDays} days. Atelier members get ${config.rules.atelierRefundDays}. Digital notes refund only if the file was not opened.`
    };
  }
  if (/member|paywall|plan|household|atelier|subscribe/.test(q)) {
    return {
      agent: "Sales Agent",
      action: "offer_plan",
      reply: "Sales Agent: browse is free. Household is $12 a month for member prices and the notes. Atelier is $36 if you want the longer refund window."
    };
  }
  if (/price|cost|how much|discount/.test(q)) {
    const item = product || config.products[0];
    return {
      agent: "Pricing Agent",
      action: "quote",
      sku: item.sku,
      reply: `Pricing Agent: ${item.name} is $${item.price}. Household pays $${item.memberPrice === 0 ? "nothing, it is included" : item.memberPrice}. Stock on hand: ${item.stock}.`
    };
  }
  if (/buy|order|checkout|ship/.test(q)) {
    const item = product || config.products[0];
    return {
      agent: "Sales Agent",
      action: "checkout",
      sku: item.sku,
      payLink: item.payLink || "",
      reply: item.payLink
        ? `Sales Agent: I can take you to checkout for the ${item.name}.`
        : `Sales Agent: the ${item.name} is open to buy. No payment link is set yet, so checkout stays in demo and does not charge a card.`
    };
  }
  if (/stop|halt|kill/.test(q)) {
    return {
      agent: "Governance Agent",
      action: "hold",
      reply: "Governance Agent: new irreversible charges pause when the owner sends an emergency stop from the owner desk. Orders already paid still ship."
    };
  }
  return {
    agent: "Support Agent",
    action: "answer",
    reply: "Support Agent: I can quote a price, start a buy, explain the $12 paywall, or walk a refund. Ask in plain words."
  };
}

async function polish(decision, text) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return decision;
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are a shop agent. Keep the decision. Two short sentences. Do not invent a lower price or a refund the decision did not allow." },
          { role: "user", content: `Customer: ${text}\nDecision: ${decision.reply}` }
        ],
        max_tokens: 120
      })
    });
    const data = await res.json();
    const next = data.choices?.[0]?.message?.content;
    if (next) decision.reply = next.trim();
    decision.model = "groq";
  } catch (err) {
    decision.modelError = "fallback";
  }
  return decision;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const body = await readJson(req);
  const text = String(body.message || "").slice(0, 500);
  if (!text) return res.status(400).json({ error: "Say what you need." });
  const config = loadConfig();
  const decision = await polish(decide(text, config), text);
  const event = {
    eventId: Math.random().toString(36).slice(2, 10),
    at: new Date().toISOString(),
    agent: decision.agent,
    action: decision.action,
    sku: decision.sku || ""
  };
  console.log(JSON.stringify({ layer: "ai-commerce", ...event }));
  res.status(200).json({ ...decision, event });
};
