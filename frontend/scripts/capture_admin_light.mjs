import { spawn } from "node:child_process";
import fs from "node:fs";

const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new",
  "--remote-debugging-port=9422",
  "--no-first-run",
  "--disable-gpu",
  "--window-size=1440,900",
  "about:blank"
], { stdio: "ignore" });

await new Promise(r => setTimeout(r, 2000));
const res = await fetch("http://127.0.0.1:9422/json/list");
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

await send("Page.navigate", { url: "http://localhost:5173/login" });
await new Promise(r => setTimeout(r, 1000));

await send("Runtime.evaluate", {
  expression: `
    localStorage.setItem("ern_user", JSON.stringify({ id: 3, name: "Enterprise Admin", email: "admin@enterprise.io", role: "admin" }));
    localStorage.setItem("ern-theme-mode", "light");
    localStorage.setItem("ern-theme", "light");
    document.documentElement.classList.remove("dark");
  `
});

// Admin Dashboard
await send("Page.navigate", { url: "http://localhost:5173/admin/dashboard" });
await new Promise(r => setTimeout(r, 2000));
const shotDash = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync("C:\\Users\\mddan\\.gemini\\antigravity-ide\\brain\\4d5beb45-3631-4bd8-901c-f5c4dfe957d5\\scratch\\audit\\01_admin_dashboard_light_fixed.png", Buffer.from(shotDash.result.data, "base64"));
console.log("Saved 01_admin_dashboard_light_fixed.png");

// Admin Requests
await send("Page.navigate", { url: "http://localhost:5173/admin/requests" });
await new Promise(r => setTimeout(r, 2000));
const shotReq = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync("C:\\Users\\mddan\\.gemini\\antigravity-ide\\brain\\4d5beb45-3631-4bd8-901c-f5c4dfe957d5\\scratch\\audit\\02_admin_requests_light_fixed.png", Buffer.from(shotReq.result.data, "base64"));
console.log("Saved 02_admin_requests_light_fixed.png");

// Admin Inventory
await send("Page.navigate", { url: "http://localhost:5173/admin/inventory" });
await new Promise(r => setTimeout(r, 2000));
const shotInv = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync("C:\\Users\\mddan\\.gemini\\antigravity-ide\\brain\\4d5beb45-3631-4bd8-901c-f5c4dfe957d5\\scratch\\audit\\03_admin_inventory_light_fixed.png", Buffer.from(shotInv.result.data, "base64"));
console.log("Saved 03_admin_inventory_light_fixed.png");

ws.close();
chrome.kill();
console.log("Done!");
