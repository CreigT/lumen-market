# Lumen Market

AI commerce for one small shop. Agents sell, price, support, and hold refunds. You edit `config.js` and push.

Import on Vercel as Other. No build command. Output directory stays empty.

## What you edit

`config.js` only. Store name, prices, stock, and Stripe Payment Links.

Leave a payment link blank and checkout stays in demo. No card is charged.

## What the agents do

- Sales Agent: buy questions and checkout
- Pricing Agent: public price and member price
- Support Agent: anything else
- Refund Agent: policy under the cap, hold above it
- Governance Agent: emergency stop from the owner desk

Ask them at `/ask.html`. The route is `POST /api/agent`.

Optional: set `GROQ_API_KEY` on Vercel if you want a free-tier model to phrase the reply. The decision still comes from the rules, not the model.

---

## Money Loop — Next Steps

Sheet writes from Lumen Market are already in the repo (`api/stripe-webhook.js`, `api/events.js`, `api/sheet.js`).

**1. Turn logging on (do this first)**
- Create a Google Sheet with a tab named exactly **Sales**.
- Create a Google service account, download the JSON key, and share the Sheet with the service-account email (Editor).
- On the Lumen Market Vercel project set:
  - `MONEY_LOOP_SHEET_ID` = Sheet ID
  - `GOOGLE_SERVICE_ACCOUNT` = full JSON key as a single-line string
- Redeploy. Blank values = no writes.

**2. Confirm a test sale lands**
- Trigger a `checkout.session.completed` or `charge.succeeded` (or `storefront.checkout.paid`) with a positive amount.
- Confirm a new row appears in the Sales tab: date, sku, amount, source.

**3. Apps Script + triggers (separate from this repo)**
- `runCycle` (daily 6 AM Pacific)
- `deployAuto` (write-only until `DEPLOY_V1`)
- `runKillSwitch` (every 15 min)
- `expireTokens` (nightly)
- `sendGmail` (approve link)

**4. Separate Vercel project for the dashboard**
- `money-loop.html` + `approve.html`
- `api/status.js` (GET) and `api/decide.js` (POST)
- Same Sheet ID. Env: `GOOGLE_SERVICE_ACCOUNT`, `SHEET_ID`, `CAP_DOLLARS`, `KILL_LOSS`, `KILL_SIGMA`.

**5. Build order**
1. Lumen Sheet writes (done)
2. Confirm test sale lands
3. Apps Script + triggers
4. Dashboard Vercel project
5. Seven-day read-only dry run
6. Flip `DEPLOY_V1`

**Definition of done:** One dollar moves from Lumen sale → Sheet → gate → deploy recommendation with no human, and anything over cap stops with a working mobile approve link.

Sheet tabs expected: Sales (written by Lumen), Costs, MoneyLoop, Pending, Kills, Tokens, Config.
