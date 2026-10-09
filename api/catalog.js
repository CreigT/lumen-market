const fs = require("fs");
const path = require("path");

module.exports = async function handler(_req, res) {
  const file = path.join(process.cwd(), "data", "catalog.json");
  const catalog = JSON.parse(fs.readFileSync(file, "utf8"));
  if (process.env.STORE_NAME) catalog.store.name = process.env.STORE_NAME;
  if (process.env.SUPPORT_EMAIL) catalog.store.supportEmail = process.env.SUPPORT_EMAIL;
  res.setHeader("cache-control", "public, max-age=60");
  res.status(200).json(catalog);
};
