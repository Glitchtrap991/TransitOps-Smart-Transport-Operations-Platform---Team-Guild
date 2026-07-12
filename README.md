# TransitOps — Smart Transport Operations Platform

> **Odoo Hackathon Submission — Built by Team Guild**  
> An enterprise-grade, full-stack MERN (MongoDB, Express, React, Node.js) SaaS platform built for logistics and transport operations management. TransitOps streamlines fleet dispatching, driver compliance, maintenance tracking, and real-time financial ROI analytics with automated state-machine workflows.

---

## ⚡ Quick Start & Demo Mode

For hackathon judges and evaluators evaluating the application locally or in cloud previews, TransitOps includes an automated database simulation engine to bypass manual data entry.

1. **Click `⚡ Reset Demo Data`** in the top navigation bar.  
2. This instantly clears existing collections and populates MongoDB with:
   * **10 Vehicles:** Covering varied statuses (`Available`, `On Trip`, `In Shop`, `Retired`) and capacities, strictly including **`Van-05`** (`500 kg` capacity, `Available`, `$25,000` acquisition cost).
   * **10 Drivers:** Pre-populated with active, suspended, and expired licenses, including **`Alex Logan`** (`Available` status, active license).
   * **Historical Operational Data:** 15+ completed trips and 20+ fuel/maintenance logs to immediately animate charts and calculate financial metrics.
3. **Login with Role-Based Accounts (Default Password: `password123`):**
   * 👑 **Fleet Manager:** `manager@transitops.com` *(Lijo Felix)*
   * 🚚 **Driver:** `driver@transitops.com` *(Alex Logan)*
   * 🛡️ **Safety Officer:** `safety@transitops.com` *(Sarah Jenkins)*
   * 📈 **Financial Analyst:** `finance@transitops.com` *(David Vance)*

---

## 🏗️ Core Architecture & Navigation

To maintain a clean user experience without sidebar clutter, TransitOps consolidates operations into **Four High-Visibility Command Tabs**:

* **Tab 1: Command Center (Dashboard & Analytics)**
  * Interactive KPI stat cards (*Active Vehicles*, *Available Vehicles*, *In Maintenance*, *Drivers On Duty*).
  * **Visual Analytics (Recharts):** Operational cost breakdowns (Fuel vs. Maintenance), Fleet Status Distribution donuts, and Fuel Efficiency ($\text{km/L}$) tracking over time.
  * Live red/amber license expiration alert banners.
* **Tab 2: Fleet & Drivers (Registry & Compliance)**
  * Unified management tables for vehicles and drivers with real-time status badges.
  * **Document Management:** Upload compliance documents (RC Book, Commercial Insurance, Pollution Under Control badges) and toggle verification states.
* **Tab 3: Operations (Dispatch & Active Trips)**
  * Complete trip lifecycle management (`Create`, `Dispatch`, `Complete`, `Cancel`).
  * Enforces real-time capacity validation and automated state-machine transitions.
* **Tab 4: Logs & Expenses (Maintenance & Fuel Tracking)**
  * Unified ledger for shop repair tickets and fuel receipts.
  * Automatically removes vehicles in maintenance from the dispatch pool.

---

## 🚀 The 9-Step Hackathon Verification Workflow

TransitOps strictly implements **Section 5 of the Odoo Hackathon Requirement Document**. You can verify 100% of the required business logic in under 3 minutes using this sequence:

| Step | Action / Workflow | Automated System Behavior |
| :--- | :--- | :--- |
| **1 & 2** | Go to **Fleet & Drivers**. Verify `Van-05` (`500 kg`) and driver `Alex Logan` exist. | System displays both assets with green `Available` badges. Attempting to assign a suspended/expired driver triggers a red validation toast. |
| **3 & 4** | Go to **Operations** $\rightarrow$ Click **Create Trip**. Select `Van-05` and `Alex`. | **QoL Feature:** Type `550` into Cargo Weight. The live progress bar turns crimson red ($>100\%$) and locks the Submit button ($550\text{ kg} > 500\text{ kg}$). Change to `450` to submit successfully. |
| **5** | Click **Dispatch** on the newly created trip. | **State Machine:** Both `Van-05` and `Alex` automatically flip their status badges from `Available` to blue `On Trip` across all tables. |
| **6 & 7** | Click **Complete Trip**. Enter final odometer reading (`+150 km`) and liters consumed (`15 L`). | **State Machine:** Both assets automatically revert to `Available`. The trip logs odometer metrics and calculates fuel efficiency ($10\text{ km/L}$) live. |
| **8** | Go to **Logs & Expenses** $\rightarrow$ Log an Oil Change repair for `Van-05`. | **Maintenance Lockout:** `Van-05` status turns amber (`In Shop`). When you open the Create Trip modal, `Van-05` is completely hidden from the dispatch selection pool. |
| **9** | Return to **Command Center** $\rightarrow$ Navigate to Financial Table. | View updated operational costs. Click **Export PDF** (`jspdf-autotable`) or **Export CSV** to download a formatted financial summary document. |

---

## 🧠 Financial Intelligence & Formulas

TransitOps computes asset performance dynamically on the server side without relying on static mock totals.

* **Fuel Efficiency ($\text{km/L}$):**
  $$\text{Efficiency} = \frac{\text{Final Odometer} - \text{Initial Odometer}}{\text{Fuel Consumed (Liters)}}$$

* **Vehicle ROI (%):**
  $$\text{Vehicle ROI} = \frac{\text{Revenue} - (\text{Total Maintenance Cost} + \text{Total Fuel Cost})}{\text{Acquisition Cost}} \times 100$$

---

## 🛠️ Tech Stack & Packages

### **Frontend (`/client` or `/frontend`)**
* **Framework:** React 18 (Vite SPA)
* **Styling & UI:** Tailwind CSS (with native class-based Dark/Light Mode toggle)
* **Icons:** `lucide-react`
* **Data Visualization:** `recharts` (Bar, Donut, and Line charts)
* **Document Export:** `jspdf` & `jspdf-autotable`
* **Notifications:** `react-hot-toast` (Instant feedback for CRUD and state transitions)

### **Backend (`/server` or `/backend`)**
* **Runtime & Framework:** Node.js, Express.js
* **Database & ODM:** MongoDB Atlas, Mongoose
* **Authentication:** JSON Web Tokens (JWT), `bcrypt` password hashing
* **Middleware:** `cors` (Cross-Origin Resource Sharing enabled for network/cloud access), `dotenv`

---

## 📁 Repository Structure

```text
TransitOps/
├── client/                     # Frontend Vite SPA
│   ├── src/
│   │   ├── components/         # Modals, Navbar, Tab Navigation, KPI Cards
│   │   ├── config/             # Centralized API configuration (import.meta.env)
│   │   ├── context/            # AuthContext, ThemeContext (localStorage sync)
│   │   ├── pages/              # Command Center, Fleet, Operations, Logs
│   │   └── App.jsx             # Route definitions & <Toaster/> wrapper
│   ├── public/                 # Static assets & icons
│   ├── tailwind.config.js      # Tailwind configuration (darkMode: 'class')
│   └── package.json            # Frontend dependencies
├── server/                     # Backend Express API
│   ├── controllers/            # auth, demo, maintenance, expense, trip logic
│   ├── middleware/             # JWT auth verification, role-based guards
│   ├── models/                 # Mongoose schemas (User, Vehicle, Driver, Trip, Log)
│   ├── routes/                 # Express API endpoint definitions
│   ├── utils/                  # seedUsers.js & demo database reset engine
│   ├── server.js               # App entry point & CORS configuration
│   └── package.json            # Backend dependencies
├── vercel.json                 # Vercel deployment & SPA routing rewrite rules
└── README.md                   # Project documentation
```

---

## 💻 Local Setup & Installation

### **1. Prerequisites**
* Node.js (v18 or higher recommended)
* MongoDB Atlas connection string (or local MongoDB instance)
* Git

### **2. Clone the Repository**
```bash
git clone [https://github.com/YourUsername/TransitOps-Smart-Transport-Operations-Platform.git](https://github.com/YourUsername/TransitOps-Smart-Transport-Operations-Platform.git)
cd TransitOps-Smart-Transport-Operations-Platform
```

### **3. Backend Setup**
```bash
cd server
npm install
```
Create a `.env` file in the `/server` root directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/transitops?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
```
Seed the test accounts and start the server:
```bash
node utils/seedUsers.js
npm run dev
```
*The backend API will run on `http://localhost:5000`.*

### **4. Frontend Setup**
Open a new terminal window:
```bash
cd client
npm install
```
Create a `.env` file in the `/client` root directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the Vite development server:
```bash
npm run dev -- --host
```
*The frontend application will be accessible at `http://localhost:5173` (and across your local Wi-Fi network via your IPv4 address).*

---

## ☁️ Cloud Deployment Guidelines

This project is configured for decoupled cloud hosting using **Vercel** for the frontend SPA and **Render** for the Node.js API.

### **Frontend (Vercel)**
* Connect the repository to Vercel.
* The included `vercel.json` file automatically overrides default settings to step into the client directory and handle React Router Single Page Application rewrites:
  ```json
  {
    "installCommand": "cd client && npm install",
    "buildCommand": "cd client && npm run build",
    "outputDirectory": "client/dist",
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
* Set the environment variable in the Vercel dashboard:  
  `VITE_API_URL` = `https://your-backend-app.onrender.com/api`

### **Backend (Render)**
* Create a new Web Service on Render pointing to the `/server` directory.
* Add Environment Variables: `MONGO_URI`, `JWT_SECRET`, and `PORT` (`5000`).
* In `server.js`, ensure CORS accepts requests from your Vercel production domain (or use `{ origin: '*' }` for hackathon demos).

---

## 👥 Contributors (Team Guild)
* **[Aparajith V](https://github.com/Glitchtrap991)**
* **[Allen Joseph G](https://github.com/unknownhackerworld)** 
* **[Prasanna Venkatesan E](https://github.com/PrasannaVenkatesanE)**
* **Alan Babu K** 
