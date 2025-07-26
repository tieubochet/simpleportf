# Crypto Portfolio Tracker

A modern, client-side cryptocurrency portfolio tracker that allows you to manage assets across multiple wallets, monitor real-time values, and visualize your holdings. Built with React, TypeScript, and Tailwind CSS, and designed for easy deployment on Vercel.

![alt](https://private-user-images.githubusercontent.com/91001349/471089075-ba27ac6b-ee67-4b01-b20e-9060cdb93e7b.png)

---

## ✨ Features

-   **Global Market Dashboard**: A sticky header provides a real-time overview of the market, including **ETH Gas Price**, **Total Market Cap** with 24h change, **24h Volume**, and **BTC/ETH Dominance**.
-   **Comprehensive Portfolio Summary**: At a glance, see your **Total Portfolio Value**, overall **24h Change**, total **Profit/Loss**, and the **Top Performing Asset** in the last 24 hours.
-   **Multi-Wallet Management**: Organize your assets by creating separate wallets (e.g., "Binance Exchange", "Ledger Hardware", "DeFi Staking").
-   **Detailed Asset Tracking**: Each wallet contains a detailed table of its assets, showing:
    -   Market Cap Rank
    -   Quantity & Average Buy Price
    -   Current Price
    -   **24h & 7d Price Change %**
    -   Unrealized Profit/Loss
    -   Total Value
-   **Transaction-Level History**: Add `buy`, `sell`, `transfer_in`, and `transfer_out` transactions for each asset with specific dates, quantities, and prices.
-   **Dynamic Allocation Chart**: A beautiful pie chart visualizes the weight of each asset in your overall portfolio.
-   **Client-Side & Private**: Runs entirely in your browser. All data is securely stored in your browser's `localStorage`. No accounts, no data collection.
-   **Import/Export**: Easily back up your entire portfolio to a JSON file or import it on another device.
-   **Responsive & Modern UI**: Clean and accessible interface built with Tailwind CSS that works beautifully on desktop and mobile.
-   **Smart Pagination**: Asset tables with more than 10 tokens are paginated for a cleaner view.

## 🛠️ Tech Stack

-   **Frontend**: [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Charting**: [Recharts](https://recharts.org/)
-   **Modules**: Served directly via [esm.sh](https://esm.sh/) CDN (no `node_modules`!).
-   **Unique IDs**: [uuid](https://github.com/uuidjs/uuid)

## 🚀 Getting Started

This project is configured to run without a local build step, using modern browser features.

### Prerequisites

You only need a modern web browser. For local development, a simple static file server is helpful. You can use the `serve` package for this.

If you don't have `serve`, install it globally:
```bash
npm install -g serve
```

### Running Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/tieubochet/simpleportf.git
    cd your-repo-name
    ```

2.  **Start a local server:**
    Run the following command from the root of the project directory:
    ```bash
    serve .
    ```

3.  Open your browser and navigate to the URL provided by `serve` (usually `http://localhost:3000`).

## 🌐 Deployment to Vercel

Deploying this application to Vercel is a straightforward process.

1.  **Push your code to a GitHub repository.**

2.  **Sign up or Log in to [Vercel](https://vercel.com/).**

3.  **Create a New Project:**
    -   Click the "Add New..." button and select "Project".
    -   Import the GitHub repository you just created.

4.  **Configure the Project:**
    Vercel is smart and will likely detect the correct settings. If you need to configure it manually, use the following:
    -   **Framework Preset**: `Other`
    -   **Build & Development Settings**: You can leave all build settings (Build Command, Output Directory, Install Command) empty, as no build process is required.

5.  **Deploy:**
    -   Click the "Deploy" button.
    -   Vercel will build and deploy your site. You'll be provided with a live URL for your portfolio tracker!

## 📂 Project Structure

```
.
├── components/          # Reusable React components
│   ├── AddAssetModal.tsx
│   ├── AddTransactionModal.tsx
│   ├── AddWalletModal.tsx
│   ├── AllocationChart.tsx
│   ├── AssetTable.tsx
│   ├── GlobalStatsBar.tsx
│   ├── icons.tsx
│   ├── PortfolioHeader.tsx
│   ├── PortfolioSummary.tsx
│   ├── TopPerformer.tsx
│   └── WalletCard.tsx
├── hooks/               # Custom React hooks
│   └── usePortfolio.ts
├── services/            # API interaction logic
│   └── coingecko.ts
├── App.tsx              # Main application component
├── index.html           # HTML entry point with import maps
├── index.tsx            # React root renderer
├── metadata.json        # Application metadata
├── README.md            # You are here!
└── types.ts             # Shared TypeScript types
```