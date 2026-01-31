# Crypto Portfolio Tracker

A modern, hybrid cryptocurrency portfolio tracker built with **React**, **Vite**, and **Supabase**. It supports both offline usage (Guest Mode) and real-time cloud synchronization (Cloud Mode).

## 🚀 Key Features

- **Hybrid Storage Architecture**:
  - **Guest Mode**: Use immediately without login. Data is stored securely in your browser's `localStorage`.
  - **Cloud Mode**: Login/Sync to backup your data and access your portfolio across multiple devices.
- **Real-time Sync**: Seamlessly synchronizes data between LocalStorage and Supabase Database upon login.
- **Multi-Wallet Management**: Organize your assets across unlimited custom wallets.
- **Detailed Asset Tracking**:
  - Real-time price updates via CoinGecko API.
  - Transaction logging (Buy, Sell, Transfer In/Out).
  - Accurate P/L (Profit/Loss) calculation.
  - Average Buy Price & Realized P/L analysis.
- **Gamification**: Daily Streak tracking for multiple chains (Base, Celo, Optimism, Monad, etc.).
- **Visual Analytics**: Interactive allocation charts using `Recharts`.
- **Privacy First**: Toggle "Privacy Mode" to hide balance values.

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (Custom Hybrid Hooks)
- **Backend (BaaS)**: Supabase (PostgreSQL, Auth, Realtime)
- **Web3**: Ethers.js (for on-chain streak interactions)

## ⚙️ Installation & Local Development

### 1. Clone the repository
```bash
git clone https://github.com/tieubochet/simpleportf.git
cd simpleportf

```

### 2. Install dependencies

```bash
npm install

```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

```

### 4. Run the development server

```bash
npm run dev

```

Open `http://localhost:5173` in your browser.

## ☁️ Supabase Setup (Database)

To enable Cloud Sync, you need to set up a Supabase project:

1. Go to [Supabase](https://supabase.com) and create a new project.
2. Go to the **SQL Editor** and run the following script to create tables and RLS policies:

```sql
-- 1. Create Tables
create table wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid default auth.uid() not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table assets (
  id uuid default gen_random_uuid() primary key,
  wallet_id uuid references wallets(id) on delete cascade not null,
  coin_id text not null,
  symbol text not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table transactions (
  id uuid default gen_random_uuid() primary key,
  asset_id uuid references assets(id) on delete cascade not null,
  type text not null,
  quantity numeric not null,
  price_per_unit numeric not null,
  fee numeric default 0,
  date timestamp with time zone not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table wallets enable row level security;
alter table assets enable row level security;
alter table transactions enable row level security;

-- 3. Create Policies
create policy "Users can manage their own wallets" on wallets for all using (auth.uid() = user_id);
create policy "Users can manage their own assets" on assets for all using (
  wallet_id in (select id from wallets where user_id = auth.uid())
);
create policy "Users can manage their own transactions" on transactions for all using (
  asset_id in (select a.id from assets a inner join wallets w on a.wallet_id = w.id where w.user_id = auth.uid())
);

```

3. Go to **Authentication** -> **Providers** and enable **Google** or **GitHub** (configure Client ID/Secret).

## 📦 Deployment

This project is optimized for **Vercel**.

1. Push your code to GitHub.
2. Import the repository on Vercel.
3. Add the Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in Vercel Project Settings.
4. Deploy!

## 📄 License

This project is open-source and available under the MIT License.
