function flag(name) {
  return Boolean(process.env[name]);
}

module.exports = async function handler(_req, res) {
  const paymentsLive = flag("STRIPE_SECRET_KEY") && flag("STRIPE_PRICE_HOUSEHOLD");
  res.status(200).json({
    mode: paymentsLive ? "live" : "demo",
    paymentsLive,
    storeName: process.env.STORE_NAME || "Lumen Market",
    variables: {
      STORE_NAME: flag("STORE_NAME"),
      SUPPORT_EMAIL: flag("SUPPORT_EMAIL"),
      PUBLIC_BASE_URL: flag("PUBLIC_BASE_URL"),
      STRIPE_SECRET_KEY: flag("STRIPE_SECRET_KEY"),
      STRIPE_WEBHOOK_SECRET: flag("STRIPE_WEBHOOK_SECRET"),
      STRIPE_PRICE_HOUSEHOLD: flag("STRIPE_PRICE_HOUSEHOLD"),
      STRIPE_PRICE_ATELIER: flag("STRIPE_PRICE_ATELIER"),
      STRIPE_PRICE_TOTE: flag("STRIPE_PRICE_TOTE"),
      STRIPE_PRICE_CARAFE: flag("STRIPE_PRICE_CARAFE"),
      STRIPE_PRICE_THROW: flag("STRIPE_PRICE_THROW"),
      STRIPE_PRICE_NOTES: flag("STRIPE_PRICE_NOTES"),
      AGENT_WEBHOOK_URL: flag("AGENT_WEBHOOK_URL")
    }
  });
};
