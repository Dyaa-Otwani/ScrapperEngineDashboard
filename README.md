Project Overview
The project focuses on:

Web scraping business listings
Storing data in MySQL
Building REST APIs using FastAPI
Visualizing analytics using React charts
Creating a responsive modern dashboard UI

The system automatically scrapes business data from multiple cities and categories, removes duplicate records, stores the cleaned data in MySQL, and displays real-time analytics through an interactive dashboard.
# Setup Instructions

## Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file inside backend folder:

```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost/business_dashboard
```

Create MySQL database:

```sql
CREATE DATABASE business_dashboard;
```

Run backend:

```bash
uvicorn app.main:app --reload --port 8001
```

Backend URL:

```text
http://127.0.0.1:8001
```

API Documentation:

```text
http://127.0.0.1:8001/docs
```

---

## Frontend Setup

```bash
cd frontend
npm install
```

Create frontend `.env` file:

```env
VITE_API_URL=http://localhost:8001
```

Run frontend:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

# Tech Stack Used

## Frontend
- React.js
- Tailwind CSS
- Recharts / Chart.js
- Axios
- Framer Motion

## Backend
- FastAPI
- SQLAlchemy
- Python

## Database
- MySQL

## Web Scraping
- Selenium
- BeautifulSoup
- Requests
- Pandas
- WebDriver Manager

---

# Scraping Approach

The project uses Selenium and BeautifulSoup to scrape business listings from Google Maps, Justdial, and Sulekha. The scraper handles dynamic loading, infinite scrolling, pagination, duplicate removal, and multi-city scraping. Extracted business data is cleaned and stored directly into the MySQL database in real time.

---

# API Working

The backend is built using FastAPI and provides APIs for:
- Inserting scraped business listings into MySQL
- Fetching dashboard analytics
- City-wise business count
- Category-wise business count
- Source-wise business count
- Exporting data into CSV

All APIs fetch live data directly from MySQL.

---

# Dashboard Functionality

The dashboard visualizes:
- Total business listings
- City-wise analytics
- Category-wise analytics
- Source-wise analytics
- Real-time chart updates
- Responsive analytics cards and charts

Charts are built using Recharts/Chart.js with responsive layouts and hover effects.

---

# Challenges Faced

- Handling dynamic website scraping and infinite scrolling.
- Removing duplicate business listings from multiple sources.
- Fixing MySQL integration and SQLite fallback issues.
- Making charts responsive and fixing chart rendering issues.
- Handling case-sensitive duplicate city/category names in analytics.
