<div align="center">

![header](https://capsule-render.vercel.app/api?type=waving&color=0:22c55e,100:16a34a&height=220&section=header&text=ERN&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Expiry%20Rescue%20Network&descAlignY=55&descSize=22)

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&size=20&pause=1000&color=22C55E&center=true&vCenter=true&width=600&lines=Rescuing+near-expiry+food+%26+medicines...;For+everyone,+NGOs+%26+orphanages...;Less+Waste.+More+Reach.+More+Hope.)](https://git.io/typing-svg)

![PHP](https://img.shields.io/badge/backend-PHP-777bb4?logo=php&logoColor=white&style=for-the-badge)
![MySQL](https://img.shields.io/badge/database-MySQL-4479A1?logo=mysql&logoColor=white&style=for-the-badge)
![Vercel](https://img.shields.io/badge/frontend-Vercel-000000?logo=vercel&logoColor=white&style=for-the-badge)
![Cloudinary](https://img.shields.io/badge/images-Cloudinary-3448C5?logo=cloudinary&logoColor=white&style=for-the-badge)

</div>

<div align="center">

### 📑 Table of Contents

[🎯 Goal](#-goal--main-objective) • [🛒 Who Can Buy](#-who-can-buy) • [🛍️ What Gets Listed](#️-what-gets-listed) • [🧭 How It Works](#-how-it-actually-works) • [🏗️ Architecture](#️-architecture) • [⚙️ Tech Stack](#️-tech-stack) • [🗂️ Database](#️-database-schema-prototype) • [🗺️ Roadmap](#️-roadmap) • [👥 Contributors](#-contributors)

</div>

<br>

## 🎯 Goal / Main Objective

**ERN 🌉 (Expiry Rescue Network)** is a web based platform that connects supermarkets 🛒, pharmacies 💊, and hi fi retail shops with buyers of every kind 👨‍👩‍👧‍👦🏠❤️ to redistribute nearly expired food, medicines, and daily essentials at low or discounted prices before they get thrown away 🗑️➡️♻️.

Every single day, tons of edible food 🍎🥖 and usable medicines 💊 get discarded not because they are bad, but simply because they are approaching their expiry date and shops can no longer sell them at full price 💰. At the same time, regular families, NGOs, and orphanages are all looking for ways to save money on everyday essentials 😌.

ERN closes that gap 🤝. Donors (shops, pharmacies, supermarkets, individuals) list their surplus stock in bulk 📦 — packaged food, dairy, bakery items, OTC medicines, toiletries, and other FMCG essentials — along with quantity, expiry date, and discounted price. Any verified buyer, whether it's a normal household 🧑‍🤝‍🧑, an NGO 🏢, or an orphanage 🏠, can browse and grab what they need at a fraction of the price ✅. An admin layer sits on top, verifying every account and overseeing the handover, keeping the whole network safe and trustworthy 🛡️.

The bigger vision is scalability 🚀. What starts as a food and medicine rescue network can expand into clothing drives 🧥, cosmetics, stationery for children 📚, and eventually multiple cities and categories, all running on the same core system.

> ♻️ Reduce food and medicine wastage &nbsp;•&nbsp; 🛒 Let anyone buy discounted near-expiry stock &nbsp;•&nbsp; 💸 Extra affordability for NGOs and orphanages &nbsp;•&nbsp; 🌍 Build a scalable, low cost network

<br>

## 🛒 Who Can Buy

<table>
<tr>
<td width="33%" align="center">

**🧑‍🤝‍🧑 General Public**
anyone can buy near-expiry items at discounted price, no restrictions

</td>
<td width="33%" align="center">

**🏢 NGOs**
verified NGOs get bulk quantities at further reduced rates

</td>
<td width="33%" align="center">

**🏠 Orphanages**
verified orphanages get priority access + extra discount/free items where possible

</td>
</tr>
</table>

For this prototype, all three are treated as a **single "buyer" role** with an optional type tag (`individual / ngo / orphanage`) — this keeps the system multi purpose from day one and easy to extend with tiered pricing or priority rules later.

<br>

## 🛍️ What Gets Listed

<table>
<tr>
<td width="25%" align="center">

**🍱 Food**
snacks • dairy • bakery
fruits & veggies • canned goods • beverages

</td>
<td width="25%" align="center">

**💊 Medicines**
OTC drugs • first aid
vitamins & supplements

</td>
<td width="25%" align="center">

**🧴 Essentials**
toiletries • sanitary products
cleaning supplies • diapers • stationery

</td>
<td width="25%" align="center">

**🧵 Future Scope**
clothing & blankets
cosmetics • pet food

</td>
</tr>
</table>

<br>

## 🧭 How It Actually Works

```
Donor posts item ──▶ Listed as "available" ──▶ Buyer (public/NGO/orphanage) claims it
        │                                                    │
        ▼                                                    ▼
  Cloudinary (image)                                Request "pending"
        │                                                    │
        └────────────────────▶ Admin verifies & marks "delivered"
```

| Step | What Happens |
|---|---|
| 1️⃣ Signup & Verification | Donor or Buyer (individual/NGO/orphanage) signs up → admin verifies the account before it goes live |
| 2️⃣ Donor Posts an Item | Fills item name, qty, expiry date, prices → photo uploads to Cloudinary → saved via PHP API as `available` |
| 3️⃣ Buyer Browses & Claims | Any buyer sees the live grid of listings (image, expiry, price, qty) → clicks **Claim/Buy** → creates a `pending` request |
| 4️⃣ Admin Coordinates | Tracks pending requests → marks `delivered` once handover is confirmed |
| 5️⃣ Loop Continues | Donors keep posting fresh near-expiry stock → everyone gets a steady discounted supply |

<br>

## 🏗️ Architecture

```
                        ┌──────────────────────────────┐
                        │           USERS                │
                        │  Donor / Buyer / Admin          │
                        │  (Buyer = Public, NGO, Orphanage)│
                        └───────────────┬─────────────────┘
                                        │
                                        ▼
                    ┌───────────────────────────────┐
                    │   FRONTEND (Vercel - free)      │
                    │   HTML/CSS/JS                    │
                    │   - Donor: post item + image     │
                    │   - Buyer: browse/search/claim   │
                    │   - Admin: approve/verify         │
                    └───────────────┬───────────────┘
                                    │ fetch() → REST API
                                    ▼
                    ┌───────────────────────────────┐
                    │ BACKEND (PHP - InfinityFree free)│
                    │  auth.php   listings.php         │
                    │  requests.php   admin.php        │
                    └───────────┬───────────┬─────────┘
                                │           │
                                ▼           ▼
                    ┌───────────────┐  ┌──────────────────┐
                    │  MySQL (free)  │  │ Cloudinary (free) │
                    │  users          │  │ item images       │
                    │  listings       │  │ (unsigned preset) │
                    │  requests       │  │                   │
                    └───────────────┘  └──────────────────┘
```

<br>

## ⚙️ Tech Stack

| Layer | Tech | Why |
|---|---|---|
| 🎨 Frontend | HTML / CSS / JS | fast prototype, deploys free on Vercel |
| 🚀 Hosting (frontend) | Vercel | free, instant deploys |
| 🔧 Backend | PHP (PDO/mysqli) | free hosting available, simple REST APIs |
| 🌐 Hosting (backend) | InfinityFree | free PHP + MySQL, no card needed |
| 🗄️ Database | MySQL | relational, fits users/listings/requests |
| 🖼️ Images | Cloudinary | free tier, direct client upload, no backend storage cost |

<br>

## 🗂️ Database Schema (Prototype)

```
users(id, name, role[donor/buyer/admin], buyer_type[individual/ngo/orphanage], email, password, verified)
listings(id, donor_id, item_name, category, qty, expiry_date, orig_price, discount_price, image_url, status[available/claimed/delivered], created_at)
requests(id, listing_id, buyer_id, status[pending/approved/completed], requested_at)
```

<br>

## 🗺️ Roadmap

- [x] 🧠 Idea finalized & problem defined
- [x] 🏗️ Architecture designed
- [x] ⚙️ Tech stack decided
- [ ] 🔐 Auth system (donor / buyer / admin, with buyer type)
- [ ] 📦 Listing CRUD + Cloudinary image upload
- [ ] 🔍 Buyer browse & claim flow (public + NGO + orphanage)
- [ ] 🛡️ Admin dashboard (approve users, manage requests)
- [ ] ⏰ Expiry alert system (cron/email notifications)
- [ ] 💬 Chat between donor & buyer
- [ ] 💳 Payment/donation integration
- [ ] 🎚️ Tiered pricing (NGO/orphanage priority & extra discounts)
- [ ] 🚀 Final deployment & demo

<br>

## 👥 Contributors

<table>
<tr>
<td align="center">
<b>Krishnendu Adak</b><br>
🎓 UG/SOET/30/24/343 | Reg: AU/2024/0001476 | Sec D<br>
🐙 <a href="https://github.com/QuantumSenpai">QuantumSenpai</a> &nbsp;|&nbsp;
💼 <a href="https://www.linkedin.com/in/krishnendu158/">LinkedIn</a>
</td>
</tr>
<tr>
<td align="center">
<b>Md Danish Raza</b><br>
🎓 UG/SOET/30/24/369 | Reg: AU/2024/0001692 | Sec D<br>
🐙 <a href="https://github.com/mddanish-31">mddanish-31</a> &nbsp;|&nbsp;
💼 <a href="https://www.linkedin.com/in/md-danish-raza31">LinkedIn</a>
</td>
</tr>
</table>

---

<div align="center">

![footer](https://capsule-render.vercel.app/api?type=waving&color=0:16a34a,100:22c55e&height=100&section=footer)

**Made with ♻️ to fight waste and feed hope.**

</div>
