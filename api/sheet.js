const crypto = require("crypto");

function base64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  }));
  const unsigned = `${header}.${payload}`;
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(unsigned);
  const signature = base64url(sign.sign(sa.private_key));
  const jwt = `${unsigned}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error("No access token");
  return tokenData.access_token;
}

async function appendToSales(sheetId, row) {
  if (!sheetId) return;
  const saRaw = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!saRaw) return;
  let sa;
  try { sa = JSON.parse(saRaw); } catch { return; }
  try {
    const token = await getAccessToken(sa);
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sales!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({ values: [[row.date, row.sku, row.amount, row.source]] })
      }
    );
  } catch (err) {
    console.log(JSON.stringify({ layer: "money-loop", error: String(err) }));
  }
}

module.exports = { appendToSales };
