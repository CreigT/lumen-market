# Module: Storefront & Paywall Gateway

Day module for the public face of the autonomous commerce company. Customer-readable HTML. Owner configures variables only.

1. Module name: Storefront & Paywall Gateway
2. Purpose: Give customers a landing page, catalog, reasonable membership paywall, and checkout. Give agents a stable API. Give the owner a variable desk and an emergency stop.
3. Business value: Revenue can start before the rest of the agent company is finished. Browse stays free so the paywall does not hide the goods.
4. Agent responsibilities: Sales Agent starts checkout. Pricing Agent owns list prices in catalog.json. Marketing Agent owns page copy later. Customer Support Agent reads order events. Governance Agent receives emergency stop. Treasury Agent trusts only signed Stripe webhooks.
5. Inputs: catalog.json, environment variables, checkout form, Stripe webhooks, owner stop.
6. Outputs: HTML pages, checkout session URL, event ids, config booleans, webhook receipts.
7. APIs required: Stripe Checkout Sessions, Stripe webhooks. Optional agent webhook.
8. MCP tools required: none on day one. Later: Stripe MCP, email MCP, inventory MCP.
9. Databases required: none to deploy. Vercel logs hold the audit until the Data Layer lands. Do not put card data in a database.
10. Memory requirements: browser member flag is local only and is not proof of payment. Live entitlement must come from Stripe later.
11. Security controls: no secrets in the browser, security headers, Stripe signature check when the webhook secret is set, zero card handling.
12. Failure recovery: if Stripe is down or unset, checkout falls back to demo and labels itself demo. Catalog is a static file, so the shop still renders if the agent bus is down.
13. Agent-to-agent: storefront emits commerce events. It does not call other agents directly. They subscribe to the webhook.
14. Workflow: person opens landing, browses shop, hits pricing, submits checkout, Stripe or demo, member page unlocks, event is logged.
15. Data flow: catalog file to API to page. Checkout form to API to Stripe. Stripe webhook to logs and future Finance agents.
16. Decision logic: live charge only if secret key and price id exist. Membership plans use subscription mode. Goods use payment mode. Gated file is included at member price 0.
17. Escalation: emergency stop is owner-only. Refunds are not executed here. Charges over a future threshold wait for Governance.
18. KPIs: page views, checkout starts, paid sessions, demo sessions, paywall views, stop events.
19. Logging: JSON logs on checkout, events, and webhooks. No card numbers. No full emails in the webhook log line.
20. Audit trail: event id, type, source, timestamp. Stripe event id on webhook.
21. Compliance: plain legal page, receipt via Stripe, refund window stated, privacy limited to name and email.
22. Future expansion: real entitlement from Stripe customer portal, inventory holds, tax display, locale, agent-written product copy.
23. Risks: local member flag can be toggled in demo. Unsigned webhooks if secret is missing. Catalog edits are a deploy, not a live agent write yet.
24. Testing: open each page, demo checkout, missing email rejected, config hides secrets, webhook rejects a bad signature.
25. Production checklist: domain, Stripe live keys, webhook secret, support email, legal review of refund line, AGENT_WEBHOOK_URL pointed at Governance.
26. Stack: HTML, CSS, vanilla JS, Vercel Node functions, Stripe REST. No framework.
27. Cost: Vercel hobby or pro. Stripe fees on live charges. This module has no always-on server cost.
28. Deployment: push GitHub, import Vercel, set variables, redeploy.
29. Maintenance: change copy in HTML, prices in catalog.json and Stripe, then push. Agents must not hot-edit production HTML until the CI/CD agent exists.
30. More automation: Content Agent rewrites product blurbs into catalog.json via pull request. Pricing Agent opens a price-change PR. Neither deploys alone.
