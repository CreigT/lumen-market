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
