# Care Dent

Website, customer portal and admin back-office for **Care Dent** — dental
equipment sales, installation and service, Chennai.

```
CareDent/
├── FRONTEND/      React 19 + Vite 8 + Tailwind 4  (public site, portal, admin)
└── BACKEND/       Node + Express 5 + MongoDB       (REST API)
```

---

## Quick start

You need **Node 20+** and a **MongoDB** database (local `mongod`, or a free
MongoDB Atlas cluster).

### 1. Backend

```bash
cd BACKEND
cp .env.example .env          # then edit MONGODB_URI and JWT_SECRET
npm install
npm run seed -- --demo        # catalogue + admin account + sample data
npm run dev                   # http://localhost:5000
```

`npm run seed` is idempotent — run it again any time to refresh the catalogue.
Use `npm run seed:fresh` to wipe and rebuild everything.

Seeded logins:

| Role     | Email                | Password       |
|----------|----------------------|----------------|
| Admin    | `admin@caredent.com` | `CareDent@2025` |
| Customer | `demo@clinic.com`    | `Demo@12345`   |

Change `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` before seeding in production.

### 2. Frontend

```bash
cd FRONTEND
cp .env.example .env          # VITE_API_URL, defaults to localhost:5000/api
npm install
npm run dev                   # http://localhost:5173
```

---

## What's where

### Public site
| Route            | Page |
|------------------|------|
| `/`              | Home — hero, about, testimonials, flagship models, services, CTA |
| `/about`         | Company story, vision, mission |
| `/products`      | Catalogue, filterable by category, searchable via `?q=` |
| `/products/:slug`| Product detail — gallery, features, spec table, related models |
| `/services`      | Services & AMC, plus the service-request booking form |
| `/track-order`   | Track an order, service ticket or quotation by reference |
| `/contact`       | Enquiry form and contact details |
| `/login`         | Sign in / create a clinic account |
| `/portal`        | Customer portal (auth required) |
| `/admin`         | Admin back-office (admin role required) |
| `*`              | 404 |

### Customer portal
Orders with live status, quotations, service tickets, invoices and downloadable
manuals — all scoped to the signed-in clinic.

### Admin back-office
Dashboard with live counts and revenue, plus full management of products,
orders, quotations, service tickets, invoices, customers, website enquiries and
documents.

---

## API

Base URL `http://localhost:5000/api`. Auth is a JWT bearer token (also set as an
httpOnly cookie).

**Public**
```
GET    /health
GET    /products?q=&category=&kind=&featured=
GET    /products/categories
GET    /products/:slug
GET    /services
POST   /quotations                 GET /quotations/track/:reference
POST   /contact
POST   /service-requests           GET /service-requests/track/:reference
GET    /orders/track/:reference
```

**Auth**
```
POST   /auth/register  /auth/login  /auth/logout
GET    /auth/me        PATCH /auth/me   PATCH /auth/me/password
```

**Customer portal** (bearer token)
```
GET    /portal/overview
GET    /portal/orders            /portal/orders/:id
GET    /portal/quotations        /portal/service-requests
GET    /portal/invoices          /portal/documents
```

**Admin** (bearer token, `role: admin`)
```
GET    /admin/dashboard
       /admin/products          POST PATCH DELETE  + POST /:id/images
       /admin/orders            POST PATCH DELETE
       /admin/quotations        PATCH DELETE
       /admin/service-requests  PATCH DELETE
       /admin/invoices          POST PATCH DELETE  + POST /:id/payment
       /admin/customers         PATCH /:id/active
       /admin/messages          PATCH DELETE
       /admin/documents         POST DELETE
PUT    /admin/services
```

Errors always come back as
`{ success: false, message, errors?: [{ field, message }] }`.

---

## Notes

**Email notifications** are optional. Fill in the `SMTP_*` variables in
`BACKEND/.env` and quote requests, contact messages and service tickets will be
emailed to `NOTIFY_EMAIL`. Left blank, they are logged to the console instead
and nothing breaks.

**Uploads** go to `BACKEND/uploads/` and are served from `/uploads/...`. For a
real deployment, put them on S3 or a persistent volume — most hosts wipe the
container filesystem on redeploy.

**Product photos** in `FRONTEND/public/products/` were extracted from the
official Care Dent product catalogue.

**Offline resilience:** if the API is unreachable, the public catalogue falls
back to the bundled copy in `FRONTEND/src/data/products.js`, so the marketing
site still renders. The portal and admin correctly show an error instead.
