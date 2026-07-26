# 🌴 Dream Vacation Planner

A full-stack, end-to-end dynamic web app with real accounts. People sign
up with their email, land on a dashboard, plan trips through a form, and
see everything they've planned on its own dedicated page — all backed by
a real REST API and a real MySQL (Amazon RDS) database. Every trip is
tied to the signed-in account, so one person's plans never show up in
someone else's list.

This README is written so a beginner can follow it step by step, both to
run the project on your own laptop and to deploy it for real on AWS.

## App flow

```
/login  →  sign in or sign up with email + password
   ↓
/dashboard  →  lands here after auth — quick stats + shortcuts
   ↓                                  ↓
/planner (Plan a Trip)          /trips (My Trips — also linkable directly)
```

- **`/login`** — combined sign-in / sign-up screen. No account access to
  anything else in the app until you're authenticated.
- **`/dashboard`** — the first page you land on after logging in. Shows a
  live count of your trips, your total dream budget, and your most recent
  plan, all pulled fresh from the database — plus two shortcuts.
- **`/planner`** — the vacation booking form. Submitting saves straight to
  RDS through the backend and redirects you to My Trips.
- **`/trips`** — every trip you've planned, as boarding-pass cards. This is
  its own page with its own URL, so you can bookmark or link directly to
  `yourdomain.com/trips` instead of always going through the dashboard.

All four pages are protected except `/login` — visiting any of them
without a valid session bounces you back to sign in.

---

## 1. What this project is made of

| Layer      | Technology                                   | What it does |
|------------|-----------------------------------------------|--------------|
| Frontend   | React (Vite) + React Router                   | Login/signup, dashboard, planner, and trips pages |
| Backend    | Node.js + Express                             | REST API for auth + vacations; validates data and talks to the database |
| Auth       | JWT (jsonwebtoken) + bcryptjs                 | Email/password accounts; passwords are hashed, never stored in plain text |
| Database   | Amazon RDS (MySQL)                            | Stores every user account and their vacation plans permanently |
| Web server | Nginx                                         | Serves the React app and forwards `/api` calls to Express |
| Hosting    | AWS EC2 (Ubuntu)                              | The virtual machine everything runs on |
| HTTPS      | Application Load Balancer + ACM certificate   | Makes the site load securely as `https://yourdomain.com` |
| Deployment | Git + SSH (manual `git pull`)                 | No CI/CD — you deploy by hand, on purpose, so you understand every step |

**How data flows:** you type into the React form → the browser sends a
`POST` request to `/api/vacations` → Nginx forwards it to the Express
backend → Express checks the data is valid → Express saves it into the
`vacations` table in RDS MySQL → the page fetches `/api/vacations` again
and your new trip appears as a card, pulled fresh from the database.

---

## 2. Folder structure

```
dream-vacation-planner/
├── frontend/                  React app (Vite)
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth.js             signup / login / fetchMe calls
│   │   │   └── vacations.js        Vacation CRUD calls (sends JWT on every request)
│   │   ├── context/AuthContext.jsx Holds the signed-in user + token, login/signup/logout
│   │   ├── components/
│   │   │   ├── Navbar.jsx          Top nav shown on every protected page
│   │   │   ├── ProtectedRoute.jsx  Redirects to /login if not signed in
│   │   │   ├── VacationForm.jsx    The booking form
│   │   │   ├── VacationList.jsx    Renders the list of trips
│   │   │   └── TicketCard.jsx      One "boarding pass" card
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx        /login — sign in / sign up
│   │   │   ├── DashboardPage.jsx   /dashboard — lands here after auth
│   │   │   ├── PlannerPage.jsx     /planner — booking form page
│   │   │   └── TripsPage.jsx       /trips — full list, directly linkable
│   │   ├── App.jsx                 Route definitions
│   │   ├── main.jsx                Wraps App in BrowserRouter + AuthProvider
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                   Express REST API
│   ├── config/db.js               MySQL connection pool (reads .env)
│   ├── controllers/
│   │   ├── authController.js       signup / login / me
│   │   └── vacationController.js   CRUD, always scoped to the signed-in user
│   ├── middleware/
│   │   ├── auth.js                 requireAuth — verifies the JWT
│   │   ├── validateAuth.js         Signup/login validation rules
│   │   └── validateVacation.js     Vacation form validation rules
│   ├── routes/
│   │   ├── auth.js                 /api/auth/*
│   │   └── vacations.js            /api/vacations/* (all protected)
│   ├── server.js                  App entry point
│   ├── package.json
│   └── .env.example                Copy this to .env and fill in real values
│
├── database/
│   └── schema.sql              Run this once on RDS to create the tables
│
├── nginx/
│   └── dream-vacation-planner.conf   Config to copy onto the EC2 server
│
├── architecture-diagram.svg    The AWS architecture diagram
├── .gitignore
└── README.md                   You are here
```

---

## 3. REST API endpoints

### Auth — base path `/api/auth` (public)

| Method | Endpoint          | What it does                                   |
|--------|--------------------|-------------------------------------------------|
| POST   | `/api/auth/signup` | Create an account. Returns a JWT + user object |
| POST   | `/api/auth/login`  | Sign in. Returns a JWT + user object |
| GET    | `/api/auth/me`     | Returns the currently signed-in user (needs the token) |

**Example signup/login body:**
```json
{ "name": "Aditi Sharma", "email": "aditi@example.com", "password": "hunter22" }
```
(`name` is only required for signup.)

The frontend stores the returned JWT in `localStorage` and sends it on
every request afterward as `Authorization: Bearer <token>`.

### Vacations — base path `/api/vacations` (all require sign-in)

Every one of these requires the `Authorization: Bearer <token>` header.
Without it, or with an expired token, the API replies `401 Unauthorized`.
Requests only ever see or change **that signed-in user's own trips** —
the backend filters every query by the user ID inside the token, not
anything the client sends.

| Method | Endpoint              | What it does                          |
|--------|------------------------|----------------------------------------|
| GET    | `/api/health`          | Quick check that the server is alive (no auth needed) |
| GET    | `/api/vacations`       | Get the signed-in user's vacation plans |
| GET    | `/api/vacations/:id`   | Get one of the signed-in user's plans |
| POST   | `/api/vacations`       | Create a new vacation plan for the signed-in user |
| DELETE | `/api/vacations/:id`   | Delete one of the signed-in user's plans |

**Example POST body:**
```json
{
  "name": "Aditi Sharma",
  "destination": "Kyoto, Japan",
  "budget": 150000,
  "days": 7,
  "travel_month": "April",
  "companions": "Friends",
  "description": "Want to see the cherry blossoms with my college friends."
}
```

If any field is missing or invalid, the API replies with `400` and a list
of exactly which fields are wrong — the React form shows those errors
right under the relevant input.

---

## 4. Database schema

Two tables inside a database called `dream_vacation_planner`. See
`database/schema.sql` for the exact SQL.

**`users`**
`id, name, email (unique), password_hash, created_at`

**`vacations`**
`id, user_id (foreign key → users.id, ON DELETE CASCADE), name, destination, budget, days, travel_month, companions, description, created_at, updated_at`

Every vacation row belongs to exactly one user. If a user account is ever
deleted, their trips are automatically deleted with it.

> **If you deployed the old version of this app before auth was added:**
> the old `vacations` table has no `user_id` column and won't work with
> this backend. Drop and recreate the database:
> `DROP DATABASE dream_vacation_planner;` then re-run `schema.sql`.

---

## 5. Running it on your own computer first (recommended before AWS)

You need **Node.js 18+** and either a local MySQL install or a free-tier
RDS instance you can already reach.

### Step 1 — Create the database
```bash
mysql -u root -p < database/schema.sql
```

### Step 2 — Start the backend
```bash
cd backend
cp .env.example .env
# open .env and fill in your DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
# also set JWT_SECRET to any long random string, e.g.:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
npm install
npm run dev
```
You should see `🚀 Dream Vacation Planner API listening on port 5000` and
`✅ Connected to MySQL (RDS) successfully`.

### Step 3 — Start the frontend
Open a **new** terminal tab:
```bash
cd frontend
npm install
npm run dev
```
Open the URL it prints (usually `http://localhost:5173`). You'll land on
the sign-in page — click **Sign Up**, create an account with your email,
and you'll be taken straight to your dashboard. From there, use **Plan a
Trip** to submit the form and **My Trips** to see everything you've
saved — all of it really saving to and loading from your database.

---

## 6. Deploying to AWS (the real deployment)

Follow these in order. Every step is manual on purpose — no CI/CD.

### Step 1 — Create the RDS MySQL database
1. AWS Console → **RDS** → **Create database**.
2. Engine: **MySQL**. Choose the Free Tier template if you're testing.
3. Set a master username and password — write these down.
4. Under **Connectivity**, note the VPC. Keep "Public access" off unless
   you specifically need it; your EC2 instance will reach it privately.
5. Once it's created, open the database and copy the **Endpoint** (a long
   `.rds.amazonaws.com` address) — this is your `DB_HOST`.
6. In its **Security group**, add an inbound rule allowing MySQL
   (port 3306) **from your EC2 instance's security group** — not from
   the whole internet.

### Step 2 — Launch the EC2 instance
1. AWS Console → **EC2** → **Launch instance**.
2. Choose **Ubuntu 22.04 LTS**.
3. Create/download a key pair (`.pem` file) — you need this to SSH in.
4. Security group: allow
   - Port **22** (SSH) from your own IP only
   - Port **80** (HTTP) from the Load Balancer's security group (set this
     up after Step 5, or temporarily allow it from anywhere while testing)
5. Launch the instance and note its public IP.

### Step 3 — Connect and install everything
```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>

# Update the system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install Git and MySQL client
sudo apt install -y git mysql-client

# Install PM2 (keeps the backend running even after you close SSH)
sudo npm install -g pm2
```

### Step 4 — Get the code onto the server
```bash
sudo mkdir -p /var/www/dream-vacation-planner
sudo chown ubuntu:ubuntu /var/www/dream-vacation-planner
cd /var/www/dream-vacation-planner

git clone https://github.com/your-username/dream-vacation-planner.git .
```

### Step 5 — Create the database table
From the EC2 instance (it can reach RDS privately):
```bash
mysql -h <your-rds-endpoint> -u admin -p < database/schema.sql
```

### Step 6 — Configure and start the backend
```bash
cd /var/www/dream-vacation-planner/backend
cp .env.example .env
nano .env
# Fill in DB_HOST (the RDS endpoint), DB_USER, DB_PASSWORD, DB_NAME
# Set CORS_ORIGIN to your real domain, e.g. https://yourdomain.com
# Set JWT_SECRET to a long random string — generate one with:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

npm install --production
pm2 start server.js --name dream-vacation-api
pm2 save
pm2 startup   # follow the on-screen command to auto-start on reboot
```

### Step 7 — Build the frontend
```bash
cd /var/www/dream-vacation-planner/frontend
npm install
npm run build
```
This creates a `dist/` folder with the production-ready static site —
that's what Nginx will serve.

### Step 8 — Configure Nginx
```bash
sudo cp /var/www/dream-vacation-planner/nginx/dream-vacation-planner.conf \
        /etc/nginx/sites-available/dream-vacation-planner.conf

sudo nano /etc/nginx/sites-available/dream-vacation-planner.conf
# Replace "your-domain.com" with your real domain

sudo ln -s /etc/nginx/sites-available/dream-vacation-planner.conf \
           /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default   # remove the default site

sudo nginx -t              # should say "syntax is ok"
sudo systemctl reload nginx
```

At this point, visiting `http://<EC2_PUBLIC_IP>` should already show the
working app over plain HTTP.

### Step 9 — Request an HTTPS certificate (ACM)
1. AWS Console → **Certificate Manager** → **Request certificate**.
2. Enter your domain (e.g. `yourdomain.com` and `www.yourdomain.com`).
3. Choose **DNS validation** and add the CNAME record it gives you to
   your domain's DNS settings (Route 53 or wherever your domain is
   registered).
4. Wait until the certificate status becomes **Issued**.

### Step 10 — Create the Application Load Balancer
1. AWS Console → **EC2 → Load Balancers → Create → Application Load Balancer**.
2. Scheme: internet-facing.
3. Listeners: add **HTTPS (443)**, attach the ACM certificate from Step 9.
   Optionally add an HTTP (80) listener that redirects to HTTPS.
4. Target group: create one pointing at your EC2 instance on **port 80**.
5. Security group for the ALB: allow inbound 443 (and 80) from anywhere.
6. Update the EC2 security group so port 80 is only reachable **from the
   ALB's security group**, not the open internet.

### Step 11 — Point your domain at the Load Balancer
1. Copy the ALB's DNS name (something like
   `dream-vacation-alb-123456.ap-south-1.elb.amazonaws.com`).
2. In your domain's DNS settings (Route 53 or your registrar), create an
   **A record (alias)** or **CNAME** pointing your domain to that ALB
   DNS name.
3. Wait for DNS to propagate (usually a few minutes), then visit
   `https://yourdomain.com` — the app should load securely.

---

## 7. Making changes after deployment (no CI/CD)

Whenever you update the code on GitHub:
```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
cd /var/www/dream-vacation-planner

git pull

# If backend files changed:
cd backend && npm install --production && pm2 restart dream-vacation-api

# If frontend files changed:
cd ../frontend && npm install && npm run build
```
Nginx automatically serves the newly built `dist/` folder — no restart needed.

---

## 8. Troubleshooting checklist

- **Site loads but "Loading submitted dream trips…" never finishes** →
  check `pm2 logs dream-vacation-api` on the EC2 instance; usually a
  database connection issue (check your `.env` values and the RDS
  security group).
- **502 Bad Gateway from Nginx** → the backend isn't running. Run
  `pm2 status` and `pm2 restart dream-vacation-api`.
- **Form submits but shows a red error box** → open the browser console;
  the API returns exactly which field failed validation.
- **Keeps bouncing back to the login page** → your token expired or
  `.env`'s `JWT_SECRET` changed since you signed in (changing the secret
  invalidates every existing token). Sign in again.
- **"Incorrect email or password" but you're sure it's right** → make
  sure you're pointing at the same database you signed up on — a fresh
  local MySQL and your RDS instance are two separate places accounts can
  live.
- **HTTPS doesn't work** → confirm the ACM certificate status is
  "Issued" and the ALB listener on 443 is using it.

---

## 9. Bonus: Running everything with Docker (optional)

You don't need Docker for the AWS deployment above (RDS already gives you
a managed database) — but if you want to run the whole stack locally
with one command, this is set up for you.

**Prerequisite:** install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
and make sure it's running.

From the project root:
```powershell
docker compose up --build
```

This builds and starts three containers:
- **mysql** — MySQL 8 with the schema and sample data loaded automatically
- **backend** — the Express API
- **frontend** — the built React app served by Nginx

Once it's running, open **http://localhost:8080** — the whole app works
exactly like the AWS version, just running entirely on your own machine.

**Stop everything:**
```powershell
docker compose down
```

**Stop and also wipe the database data:**
```powershell
docker compose down -v
```

**Rebuild after changing code:**
```powershell
docker compose up --build
```

Note: the Docker setup uses its own MySQL container on port `3307` (to
avoid clashing with any local MySQL install you already have), and its
own Nginx config (`frontend/docker.nginx.conf`) — separate from
`nginx/dream-vacation-planner.conf`, which is only used for the real
EC2 deployment described above.

---

Built with React, Express, Nginx, and Amazon RDS MySQL. 🌍✈️
