import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const outDir = "C:\\Users\\mddan\\.gemini\\antigravity-ide\\brain\\4d5beb45-3631-4bd8-901c-f5c4dfe957d5\\scratch\\audit_p2";
fs.mkdirSync(outDir, { recursive: true });

const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new",
  "--remote-debugging-port=9433",
  "--no-first-run",
  "--disable-gpu",
  "--window-size=1440,900",
  "about:blank"
], { stdio: "ignore" });

await new Promise(r => setTimeout(r, 2000));
const res = await fetch("http://127.0.0.1:9433/json/list");
const targets = await res.json();
const target = targets.find(t => t.type === "page") || targets[0];
const ws = new WebSocket(target.webSocketDebuggerUrl);

let id = 1;
const pending = new Map();
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const cb = pending.get(m.id);
    pending.delete(m.id);
    cb(m);
  }
};
await new Promise(r => ws.onopen = r);

const send = (method, params = {}) => new Promise(r => {
  const i = id++;
  pending.set(i, r);
  ws.send(JSON.stringify({ id: i, method, params }));
});

await send("Page.enable");
await send("Runtime.enable");

const setSession = async (role = "admin", theme = "light") => {
  const user = role === "admin"
    ? { id: 3, name: "Enterprise Admin", email: "admin@enterprise.io", role: "admin" }
    : role === "staff"
    ? { id: 2, name: "Retail Store Mgr", email: "staff@store.com", role: "retailer" }
    : { id: 1, name: "Valued Customer", email: "customer@ern.market", role: "customer" };

  await send("Runtime.evaluate", {
    expression: `
      localStorage.setItem("ern_user", JSON.stringify(${JSON.stringify(user)}));
      localStorage.setItem("ern-theme-mode", "${theme}");
      localStorage.setItem("ern-theme", "${theme}");
      if ("${theme}" === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    `
  });
};

const capture = async (url, filename, delay = 1200) => {
  await send("Page.navigate", { url });
  await new Promise(r => setTimeout(r, delay));
  const shot = await send("Page.captureScreenshot", { format: "png" });
  const filepath = path.join(outDir, filename);
  fs.writeFileSync(filepath, Buffer.from(shot.result.data, "base64"));
  console.log(`[Captured] ${filename}`);
};

// Login first to initialize localStorage
await send("Page.navigate", { url: "http://localhost:5173/login" });
await new Promise(r => setTimeout(r, 800));

await setSession("admin", "light");
await capture("http://localhost:5173/admin/orders", "p2_admin_orders.png");
await capture("http://localhost:5173/admin/listings", "p2_admin_listings.png");
await capture("http://localhost:5173/admin/transfers", "p2_admin_transfers.png");
await capture("http://localhost:5173/admin/suppliers", "p2_admin_suppliers.png");
await capture("http://localhost:5173/admin/locations", "p2_admin_locations.png");
await capture("http://localhost:5173/admin/organization", "p2_admin_organization.png");
await capture("http://localhost:5173/admin/policies", "p2_admin_policies.png");

await setSession("staff", "light");
await capture("http://localhost:5173/retailer/orders", "p2_retailer_orders.png");
await capture("http://localhost:5173/retailer/batches", "p2_retailer_batches.png");

await setSession("customer", "light");
await capture("http://localhost:5173/marketplace/product/prod-1", "p2_customer_product_detail.png");
await capture("http://localhost:5173/customer/orders", "p2_customer_orders.png");
await capture("http://localhost:5173/customer/profile", "p2_customer_profile.png");

// Public pages
await capture("http://localhost:5173/login", "p2_public_login.png");

ws.close();
chrome.kill();
console.log("Phase 2 captures finished!");
