# Invoice Mapper Frontend

A polished, fully interactive **React + TypeScript (Vite)** dashboard that allows dynamic interaction with the backend’s RAG pipeline. The application leverages a sleek, gradient-heavy glassmorphic UI meant to provide Administrators, Finance Officers, and Suppliers with distinct, high-performance portal views.

## 🏃 Running the Frontend Locally

1. Ensure **Node.js** (LTS/v18+) is installed.
2. In this specific directory, install all required UI/HTTP dependencies:
   ```bash
   npm install
   ```
3. Boot the local development server:
   ```bash
   npm run dev
   ```
   *Usually available on `http://localhost:5173`.*


## 🎨 Architecture & Style
*   **React (Vite)** – High-speed compilation and HMR built for deep dashboard interactivity.
*   **Plain CSS/Tailwind** – Glass-layered styling with `backdrop-filter`, glowing borders, and neon/gradient accents (`--primary`, `--success`, `--warning`).
*   **Axios** – Used exclusively for backend communication on port `8003`.
*   **Lucide React** – Dynamic SVG icons across sidebars and alert badges.

---

## 🧭 The Frontend Flow

The frontend operates through a Role-Based Access Control (RBAC) paradigm, simulating the exact touchpoints of a real invoice's lifecycle through our dynamic components in `App.tsx`:

### 1. View Toggling & State Management
*   A `userRole` state determines whether you are a **Supplier**, **Finance Officer**, or **Administrator**.
*   A persistent sidebar manages standard views: *Dashboard, Invoices, Finance Review, Admin Panel.*

### 2. The Supplier Flow (`UploadInvoiceView`)
*   **Trigger:** User drags-and-drops a `.pdf` file.
*   **Process:** A loading spinner animates while sending a `multipart/form-data` payload via Axios. The system intelligently polls backend responses until the server generates a fully classified JSON object containing line items, detected costs, and AI reasoning.
*   **Actionable UI:** A preview table instantly populates, showing mapped NDIS-style service codes. 

### 3. The Finance Review Flow (`FinanceReviewView`)
*   **Trigger:** A grid dynamically pulls `/invoices` mapped specifically to your role.
*   **Process:** Unapproved invoices light up with a yellow or red dot. The user can open up `LineItemModal` to dive deep into exactly *why* the AI assigned a specific category via a generated "LLM Confidence & Reasoning" tab.
*   **Actionable UI:** The Finance Officer evaluates the RAG result and signs off if correct.

### 4. Admin Discovery Flow (`RequestsView` & `AdminInvoiceView`)
*   **The Unmapped Edge Case:** When the backend intercepts a never-before-seen service (like "Assistive Animal Therapy"), the line-item sits locally in an `"Pending Admin Approval"` state.
*   **Category Review Queue:** The frontend continuously renders the newly discovered category name and the structurally generated Service Code from `/category-requests`.
*   **Actionable UI:** The Admin clicks the glowing green **Approve** button, sending a `HTTP PUT` back to `8003`. 
    *   *Result:* The user interface globally registers the newly approved logic. Any future uploaded invoices with that phrase will inherently recognize the service format and populate correctly in the Master Ledger. 

---

