module.exports = async function handler(_req, res) {
  res.status(200).json({
    ok: true,
    module: "storefront-paywall-gateway",
    time: new Date().toISOString()
  });
};
