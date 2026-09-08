import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const outDir = "C:\\Users\\mddan\\.gemini\\antigravity-ide\\brain\\4d5beb45-3631-4bd8-901c-f5c4dfe957d5\\scratch\\audit_p3";
fs.mkdirSync(outDir, { recursive: true });

const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new",
  "--remote-debugging-port=9444",
  "--no-first-run",
  "--disable-gpu",
  "--window-size=1440,900",
  "about:blank"
], { stdio: "ignore" });

await new Promise(r => setTimeout(r, 2000));
const res = await fetch("http://127.0.0.1:9444/json/list");
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

const setViewport = async (width, height = 900) => {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768
  });
};

const checkOverflow = async () => {
  const evalRes = await send("Runtime.evaluate", {
    expression: "document.documentElement.scrollWidth > window.innerWidth"
  });
  return evalRes.result.value;
};

const capture = async (name, pathName, role = "admin", theme = "light", width = 1440, height = 900) => {
  await setViewport(width, height);
  await send("Page.navigate", { url: `http://localhost:5173${pathName}` });
  await new Promise(r => setTimeout(r, 600));
  await setSession(role, theme);
  await send("Page.navigate", { url: `http://localhost:5173${pathName}` });
  await new Promise(r => setTimeout(r, 800));
  
  const hasOverflow = await checkOverflow();
  const scr = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(outDir, `${name}.png`), Buffer.from(scr.result.data, "base64"));
  console.log(`[Captured] ${name} (${width}px, ${theme}) - Horizontal Overflow: ${hasOverflow ? "YES" : "NO"}`);
};

console.log("=== PHASE 3 AUDIT CAPTURES STARTING ===");

// 1. Pages updated in this run (Light Mode)
await capture("p3_admin_listings", "/admin/listings", "admin", "light");
await capture("p3_admin_transfers", "/admin/transfers", "admin", "light");
await capture("p3_admin_moderation", "/admin/moderation", "admin", "light");
await capture("p3_admin_suppliers", "/admin/suppliers", "admin", "light");
await capture("p3_retailer_batches", "/retailer/batches", "staff", "light");
await capture("p3_customer_orders", "/customer/orders", "customer", "light");
await capture("p3_customer_product_detail", "/marketplace/product/prod-001", "customer", "light");

// 2. Responsive Viewport Audits (Zero Overflow Verification)
console.log("\n--- Responsive Breakpoint Verification ---");
await capture("resp_360_marketplace", "/marketplace", "customer", "light", 360, 740);
await capture("resp_375_orders", "/customer/orders", "customer", "light", 375, 667);
await capture("resp_412_admin_dashboard", "/admin/dashboard", "admin", "light", 412, 915);
await capture("resp_768_retailer_inv", "/retailer/inventory", "staff", "light", 768, 1024);
await capture("resp_1024_admin_requests", "/admin/requests", "admin", "light", 1024, 768);
await capture("resp_1280_browse", "/customer/browse", "customer", "light", 1280, 800);
await capture("resp_1440_admin_dashboard", "/admin/dashboard", "admin", "light", 1440, 900);

// 3. Dark Mode Regression Protection Check
console.log("\n--- Dark Mode Regression Check ---");
await capture("dark_reg_admin_dashboard", "/admin/dashboard", "admin", "dark", 1440, 900);
await capture("dark_reg_retailer_inventory", "/retailer/inventory", "staff", "dark", 1440, 900);
await capture("dark_reg_customer_browse", "/customer/browse", "customer", "dark", 1440, 900);

ws.close();
chrome.kill();
console.log("\n=== ALL PHASE 3 AUDIT CAPTURES COMPLETED ===");
