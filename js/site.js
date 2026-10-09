const PAGE = document.body.dataset.page || "home";
const CFG = window.LUMEN || { storeName: "Lumen Market", products: [], plans: [], rules: {} };

function nav() {
  const items = [
    ["home", "Home", "/"],
    ["shop", "Shop", "/shop.html"],
    ["ask", "Ask", "/ask.html"],
    ["pricing", "Pricing", "/pricing.html"],
    ["account", "Member", "/account.html"],
    ["owner", "Owner", "/owner.html"]
  ];
  return `<header class="wrap"><nav class="nav">
    <a class="brand" href="/"><strong>${CFG.storeName || "Lumen Market"}</strong><span>AI commerce</span></a>
    <div class="links">
      ${items.map(([id, label, href]) => `<a href="${href}" ${PAGE === id ? 'aria-current="page"' : ""}>${label}</a>`).join("")}
      <a class="btn" href="/ask.html">Ask the shop</a>
    </div>
  </nav></header>`;
}
document.body.insertAdjacentHTML("afterbegin", nav());
document.body.insertAdjacentHTML("beforeend", `<footer class="wrap site"><div>${CFG.storeName || "Lumen Market"} · agents sell, price, and support. You edit config.js.</div><div><a href="/legal.html">Plain legal</a></div></footer>`);

function money(n) { return "$" + Number(n).toFixed(0); }
function memberOn() { return localStorage.getItem("lumen_member") === "1"; }

function renderShop() {
  const root = document.querySelector("[data-shop]");
  if (!root) return;
  const member = memberOn();
  root.innerHTML = (CFG.products || []).map((p) => `
    <article class="product">
      <a href="/product.html?sku=${p.sku}"><img src="${p.image}" alt="${p.name}"></a>
      <div class="pad">
        <div class="tag">${p.stock} on hand</div>
        <h3 style="margin:8px 0 4px">${p.name}</h3>
        <p class="muted" style="margin:0 0 8px">${p.blurb}</p>
        <div class="price">${member && p.memberPrice === 0 ? "Included" : money(member ? p.memberPrice : p.price)}</div>
      </div>
    </article>`).join("");
}

function renderPlans() {
  const root = document.querySelector("[data-plans]");
  if (!root) return;
  root.innerHTML = (CFG.plans || []).map((plan) => `
    <article class="plan ${plan.id === "household" ? "featured" : ""}">
      <p class="kicker">${plan.price ? "Paywall" : "Free"}</p>
      <h3>${plan.name}</h3>
      <div class="price">${plan.price ? money(plan.price) + " / " + plan.cadence : "Free"}</div>
      <p>${plan.pitch}</p>
      <ul class="clean">${(plan.includes || []).map((i) => `<li>${i}</li>`).join("")}</ul>
      ${plan.price ? `<a class="btn copper" style="margin-top:14px" href="${plan.payLink || "/checkout.html?plan=" + plan.id}">Join ${plan.name}</a>` : `<a class="btn secondary" style="margin-top:14px" href="/shop.html">Browse</a>`}
    </article>`).join("");
}

function renderProduct() {
  const root = document.querySelector("[data-product]");
  if (!root || !CFG.products) return;
  const sku = new URLSearchParams(location.search).get("sku");
  const p = CFG.products.find((item) => item.sku === sku) || CFG.products[0];
  if (!p) return;
  const member = memberOn();
  const price = member ? p.memberPrice : p.price;
  root.innerHTML = `<div class="split">
    <img src="${p.image}" alt="${p.name}" style="width:100%;border-radius:16px;max-height:640px;object-fit:cover">
    <div>
      <p class="kicker">${p.sku} · ${p.stock} on hand</p>
      <h1>${p.name}</h1>
      <p class="lede">${p.blurb}</p>
      <p class="price">${price === 0 ? "Included with membership" : money(price)}</p>
      <div class="actions">
        <a class="btn" href="${p.payLink || "/checkout.html?sku=" + p.sku}">Buy</a>
        <a class="btn secondary" href="/ask.html">Ask an agent</a>
      </div>
    </div>
  </div>`;
}

function renderAccount() {
  const root = document.querySelector("[data-account]");
  if (!root) return;
  if (!memberOn()) {
    root.innerHTML = `<h1>Member page</h1><p class="lede">Browse is free. Household is the paywall.</p><a class="btn" href="/pricing.html">See plans</a>`;
    return;
  }
  root.innerHTML = `<h1>You are in.</h1><article class="card"><h3>Sage field notes</h3><p>Edit config.js. Leave selling to the agents. Open the owner desk only to stop the shop.</p></article>`;
}

function renderOwner() {
  const root = document.querySelector("[data-owner]");
  if (!root) return;
  const links = (CFG.products || []).filter((p) => p.payLink).length + (CFG.plans || []).filter((p) => p.payLink).length;
  root.innerHTML = `<h1>Owner desk</h1>
    <p class="lede">You are the legal owner. The only file you edit is config.js. Then push.</p>
    <table class="table"><tbody>
      <tr><td>Store</td><td>${CFG.storeName}</td></tr>
      <tr><td>Goods</td><td>${(CFG.products || []).length}</td></tr>
      <tr><td>Payment links set</td><td class="${links ? "ok" : "bad"}">${links ? links + " set" : "None yet. Demo mode. No card charged."}</td></tr>
      <tr><td>Auto refund cap</td><td>$${CFG.rules?.autoRefundMax || 25}</td></tr>
    </tbody></table>
    <p class="notice" style="margin-top:16px">Emergency stop tells the Governance Agent to hold new charges. It does not delete paid orders.</p>
    <button class="btn" id="stop">Send emergency stop</button>
    <p id="stop-result" class="muted"></p>`;
  document.getElementById("stop").onclick = async () => {
    const res = await fetch("/api/agent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: "emergency stop" }) });
    const data = await res.json();
    document.getElementById("stop-result").textContent = data.reply || "Stop sent.";
  };
}

function bindAsk() {
  const form = document.querySelector("[data-ask]");
  if (!form) return;
  form.onsubmit = async (event) => {
    event.preventDefault();
    const box = document.querySelector("[data-reply]");
    box.innerHTML = `<p class="muted">Agents are reading it.</p>`;
    const message = new FormData(form).get("message");
    const res = await fetch("/api/agent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message }) });
    const data = await res.json();
    box.innerHTML = `<p class="kicker">${data.agent || "Agent"} · ${data.action || ""}</p><p>${data.reply || data.error}</p>`;
  };
}

function bindCheckout() {
  const form = document.querySelector("[data-checkout]");
  if (!form) return;
  const params = new URLSearchParams(location.search);
  if (params.get("status") === "demo") {
    if (params.get("plan")) localStorage.setItem("lumen_member", "1");
    form.innerHTML = `<h1>Demo order noted</h1><p class="lede">No card was charged. Paste a Stripe Payment Link into config.js when you want real money.</p><a class="btn" href="/account.html">Member page</a>`;
    return;
  }
  form.onsubmit = (event) => {
    event.preventDefault();
    const plan = form.querySelector("[name=plan]").value;
    const sku = form.querySelector("[name=sku]").value;
    const item = (CFG.plans || []).find((p) => p.id === plan) || (CFG.products || []).find((p) => p.sku === sku);
    if (item && item.payLink) location.href = item.payLink;
    else location.href = `/checkout.html?status=demo&plan=${plan}&sku=${sku}`;
  };
}

renderShop();
renderPlans();
renderProduct();
renderAccount();
renderOwner();
bindAsk();
bindCheckout();
