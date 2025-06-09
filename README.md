# 🍽 Restaurant Menu & Order Management System

An end-to-end full stack application to digitally manage restaurant menus, customer orders, and admin workflows, powered by *MongoDB, **Express, **React, and **Node.js* (MERN stack).

---

## 🌐 Live Demo

- *Customer Interface:*  
  👉 [restaurant-management-cust.netlify.app](https://restaurant-management-cust.netlify.app/)

- *Admin Dashboard:*  
  👉 [restaurant-management-admin.netlify.app](https://restaurant-management-admin.netlify.app/)

- *Backend API (Render):*  
  🔗 [API Root Endpoint](https://restaurant-management-backend-tw4c.onrender.com)

---

## 🚀 Features

### 👨‍🍳 Customer Side
- Dynamic menu categorized by *Breakfast, Lunch, Dinner, Snacks, Juices, Desserts*
- Filter by *Spicy/Non-Spicy, **Vegetarian/Non-Vegetarian*
- View *Chef Specials* and *Most Ordered*
- Add quantity, special instructions, and place order
- Order review and confirmation flow
- UI built with *React + Tailwind CSS*

### 🧑‍💼 Admin Dashboard
- View and manage all orders (real-time status updates)
- View order totals, customer name, time, and item details
- View and manage menu items (Add/Edit/Delete/Toggle Availability)
- View analytics:
  - Daily Sales
  - Most Ordered Items
  - Category-wise Revenue
  - Peak Ordering Hours (chart-based)

---

## 🛠 Tech Stack

| Layer     | Technology                       |
|-----------|----------------------------------|
| Frontend  | React, Tailwind CSS              |
| Backend   | Node.js, Express.js              |
| Database  | MongoDB (NoSQL)                  |
| Hosting   | Netlify (Frontend), Render (Backend) |
| Charts    | Chart.js                         |

---




📊 API Endpoints

Menu

GET /api/menu — customer-side filterable menu

GET /api/menu/admin/all — admin: get all items

POST /api/menu/add — add new item

PUT /api/menu/:id — update item

DELETE /api/menu/:id — delete item

GET /api/menu/most-ordered — top ordered items


Orders

POST /api/order/place — place order

GET /api/order/admin — view all orders

PUT /api/order/:id/status — update status


Analytics

GET /api/analytics/sales-daily

GET /api/analytics/most-ordered

GET /api/analytics/category-revenue

GET /api/analytics/peak-hours

---

🙌 Acknowledgements

This project is built for learning full-stack development using MongoDB and practicing real-world architecture with NoSQL flexibility.
Inspired by restaurant POS and online ordering systems like Zomato, McDonald's, and Swiggy.


---

📬 Contact

👨‍💻 Developer: Rupam Deb

📧 Email: rupamdeb2020@gmail.com
