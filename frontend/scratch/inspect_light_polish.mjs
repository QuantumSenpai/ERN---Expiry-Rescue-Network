import { spawn } from "node:child_process";
import fs from "node:fs";

const profileDir = "C:\\Users\\mddan\\.gemini\\antigravity-ide\\brain\\4d5beb45-3631-4bd8-901c-f5c4dfe957d5\\scratch\\chrome_inspect_profile_3";
fs.mkdirSync(profileDir, { recursive: true });

const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new",
  "--remote-debugging-port=9355",
  `--user-data-dir=${profileDir}`,
  "--no-first-run",
  "--disable-gpu",
  "--window-size=1440,900",
  "about:blank"
], { stdio: "ignore" });

await new Promise(r => setTimeout(r, 2000));
const res = await fetch("http://127.0.0.1:9355/json/list");
const [target] = await res.json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 1;
const pending = new Map();
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) pending.get(m.id)(m);
};
await new Promise(r => ws.onopen = r);
const send = (m, p = {}) => new Promise(r => {
  const i = id++;
  pending.set(i, r);
  ws.send(JSON.stringify({ id: i, method: m, params: p }));
});

await send("Page.enable");
await send("Runtime.enable");

// Set up light mode user
await send("Page.navigate", { url: "http://localhost:5173/login" });
await new Promise(r => setTimeout(r, 1000));

await send("Runtime.evaluate", {
  expression: `
    localStorage.setItem("ern_user", JSON.stringify({id:3,name:"Enterprise Admin",email:"admin@enterprise.io",role:"admin"}));
    localStorage.setItem("ern-theme-mode", "light");
    localStorage.setItem("ern-theme", "light");
    document.documentElement.classList.remove("dark");
  `
});

// 1. Admin Dashboard in Light Mode
await send("Page.navigate", { url: "http://localhost:5173/admin/dashboard" });
await new Promise(r => setTimeout(r, 1500));
const shotAdminLight = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync("C:\\Users\\mddan\\.gemini\\antigravity-ide\\brain\\4d5beb45-3631-4bd8-901c-f5c4dfe957d5\\scratch\\light_admin_after.png", Buffer.from(shotAdminLight.result.data, "base64"));
console.log("Saved scratch/light_admin_after.png");

// 2. Admin Requests in Light Mode (Table & Badges)
await send("Page.navigate", { url: "http://localhost:5173/admin/requests" });
await new Promise(r => setTimeout(r, 1500));
const shotRequestsLight = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync("C:\\Users\\mddan\\.gemini\\antigravity-ide\\brain\\4d5beb45-3631-4bd8-901c-f5c4dfe957d5\\scratch\\light_requests_after.png", Buffer.from(shotRequestsLight.result.data, "base64"));
console.log("Saved scratch/light_requests_after.png");

// 3. Marketplace Home in Light Mode
await send("Page.navigate", { url: "http://localhost:5173/marketplace" });
await new Promise(r => setTimeout(r, 1500));
const shotMarketplaceLight = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync("C:\\Users\\mddan\\.gemini\\antigravity-ide\\brain\\4d5beb45-3631-4bd8-901c-f5c4dfe957d5\\scratch\\light_marketplace_after.png", Buffer.from(shotMarketplaceLight.result.data, "base64"));
console.log("Saved scratch/light_marketplace_after.png");

// 4. Dark Mode Regression Check
await send("Runtime.evaluate", {
  expression: `
    localStorage.setItem("ern-theme-mode", "dark");
    localStorage.setItem("ern-theme", "dark");
    document.documentElement.classList.add("dark");
  `
});
await send("Page.navigate", { url: "http://localhost:5173/admin/dashboard" });
await new Promise(r => setTimeout(r, 1500));
const shotAdminDark = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync("C:\\Users\\mddan\\.gemini\\antigravity-ide\\brain\\4d5beb45-3631-4bd8-901c-f5c4dfe957d5\\scratch\\dark_admin_regression_check.png", Buffer.from(shotAdminDark.result.data, "base64"));
console.log("Saved scratch/dark_admin_regression_check.png");

// 5. Mobile 375px Light Mode
await send("Runtime.evaluate", {
  expression: `
    localStorage.setItem("ern-theme-mode", "light");
    localStorage.setItem("ern-theme", "light");
    document.documentElement.classList.remove("dark");
  `
});
await send("Emulation.setDeviceMetricsOverride", {
  width: 375,
  height: 812,
  deviceScaleFactor: 1,
  mobile: true
});
await send("Page.navigate", { url: "http://localhost:5173/admin/dashboard" });
await new Promise(r => setTimeout(r, 1200));
const shotMobileLight = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync("C:\\Users\\mddan\\.gemini\\antigravity-ide\\brain\\4d5beb45-3631-4bd8-901c-f5c4dfe957d5\\scratch\\light_mobile_375.png", Buffer.from(shotMobileLight.result.data, "base64"));
console.log("Saved scratch/light_mobile_375.png");

ws.close();
chrome.kill();
console.log("Inspection pass complete!");
