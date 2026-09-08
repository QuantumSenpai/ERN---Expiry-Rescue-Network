import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const outDir = "C:\\Users\\mddan\\.gemini\\antigravity-ide\\brain\\4d5beb45-3631-4bd8-901c-f5c4dfe957d5\\scratch\\audit";
fs.mkdirSync(outDir, { recursive: true });

const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new",
  "--remote-debugging-port=9399",
  "--no-first-run",
  "--disable-gpu",
  "--window-size=1440,900",
  "about:blank"
], { stdio: "ignore" });

await new Promise(r => setTimeout(r, 2000));
const res = await fetch("http://127.0.0.1:9399/json/list");
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

// 1. Prime session with Light Mode
await send("Page.navigate", { url: "http://localhost:5173/login" });
await new Promise(r => setTimeout(r, 800));

await setSession("admin", "light");
await capture("http://localhost:5173/admin/dashboard", "01_admin_dashboard_light.png");
await capture("http://localhost:5173/admin/requests", "02_admin_requests_light.png");
await capture("http://localhost:5173/admin/inventory", "03_admin_inventory_light.png");
await capture("http://localhost:5173/admin/users", "04_admin_users_light.png");

await setSession("staff", "light");
await capture("http://localhost:5173/retailer/dashboard", "05_retailer_dashboard_light.png");
await capture("http://localhost:5173/retailer/inventory", "06_retailer_inventory_light.png");

await setSession("customer", "light");
await capture("http://localhost:5173/marketplace", "07_customer_marketplace_light.png");
await capture("http://localhost:5173/customer/browse", "08_customer_browse_light.png");
await capture("http://localhost:5173/customer/cart", "09_customer_cart_light.png");

// Dark Mode regression check
await setSession("admin", "dark");
await capture("http://localhost:5173/admin/dashboard", "10_admin_dashboard_dark_check.png");

ws.close();
chrome.kill();
console.log("Full audit capture finished successfully!");
