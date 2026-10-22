# StockFlow — Inventory & Stock Management System

A full-stack inventory management application designed to simplify product tracking, inventory monitoring, and stock movement management.

## 🚀 Features

* **Dashboard:** View inventory statistics, total products, available units, and inventory value.
* **Product Management:** Add, edit, delete, and search products.
* **Stock In:** Record incoming inventory and supplier deliveries.
* **Stock Out:** Record outgoing inventory and customer orders.
* **Stock Validation:** Prevent stock-out transactions that exceed available inventory.
* **Movement History:** Review stock-in and stock-out transactions.
* **Low-Stock Monitoring:** Identify products that need replenishment.
* **Automated Tests:** Validate important backend operations.

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* CSS

### Backend

* Java 21
* Spring Boot
* Spring Data JPA
* Maven
* REST APIs

### Database

* PostgreSQL

## 📁 Project Structure

```text
StockFlow/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── StockMovement.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   └── backend/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/stockflow/backend/
│       │   │   └── resources/
│       │   └── test/
│       ├── pom.xml
│       └── mvnw.cmd
│
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

Install the following before running the application:

* Java JDK 21
* Node.js and npm
* PostgreSQL
* Git

## 💻 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/pawanpushkar/StockFlow.git
cd StockFlow
```

### 2. Configure PostgreSQL

Create a PostgreSQL database named:

```sql
CREATE DATABASE stockflow_db;
```

Check the backend configuration in:

```text
backend/backend/src/main/resources/application.properties
```

Configure your database URL, username, and password for your local PostgreSQL installation. Never commit real passwords or other secrets to GitHub.

### 3. Start the Backend

Open a terminal in the project root and run:

```powershell
cd backend/backend
.\mvnw.cmd spring-boot:run
```

The backend is configured to run on:

```text
http://localhost:8080
```

### 4. Start the Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local frontend URL printed by Vite, normally:

```text
http://localhost:5173
```

## 🔌 API Endpoints

| Method | Endpoint               | Purpose                         |
| ------ | ---------------------- | ------------------------------- |
| GET    | `/api/products`        | Retrieve products               |
| POST   | `/api/products`        | Create a product                |
| PUT    | `/api/products/{id}`   | Update a product                |
| DELETE | `/api/products/{id}`   | Delete a product                |
| GET    | `/api/stock-movements` | Retrieve stock movement history |

The stock movement API is available under `/api/stock-movements`. Consult the backend controller for the supported operations and request formats.

## 🧪 Run Backend Tests

Navigate to the backend directory:

```powershell
cd backend/backend
.\mvnw.cmd clean test
```

The current development version has passed nine backend tests covering application startup, product retrieval, and stock movement validation.

## 🔐 Security Notes

This repository is intended for development and demonstration.

Before production deployment:

* Configure database credentials through environment variables or a secure secrets manager.
* Restrict API access using appropriate authentication and authorization.
* Configure production CORS settings.
* Use HTTPS.
* Validate all inputs and review error handling.

## 🎯 Project Goals

StockFlow demonstrates full-stack application development, REST API integration, relational database management, inventory business logic, and automated backend testing.

## 👨‍💻 Author

**Pawan Pushkar**

GitHub: https://github.com/pawanpushkar

## 📄 License

No license has been added yet. All rights are reserved by default unless a license is specified.
