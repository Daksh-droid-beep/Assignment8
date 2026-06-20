# TaskFlow — Modern To-Do Hub (Assignment 8)

TaskFlow is a premium, full-stack To-Do List application. It consists of a Node.js + Express.js backend connected to MongoDB via Mongoose, and a high-fidelity, responsive React frontend scaffolded with Vite.

The project is structured with a professional **Controller-Service-Routes** architecture on the backend, input validation middleware, centralized error handling, and a sleek, glassmorphic dark-themed UI on the frontend.

---

## Project Structure

```
d:/Assignment8/
├── backend/
│   ├── config/
│   │   └── db.js              # Mongoose MongoDB connection configuration
│   ├── models/
│   │   └── taskModel.js       # Mongoose Task Schema & Model
│   ├── services/
│   │   └── taskService.js     # Task database operations (Business logic)
│   ├── controllers/
│   │   └── taskController.js  # Controller mapping requests to service calls
│   ├── routes/
│   │   └── taskRoutes.js      # Endpoint route configurations
│   ├── middlewares/
│   │   ├── errorMiddleware.js      # Centralized error handler
│   │   └── validationMiddleware.js # Input validation middleware
│   ├── .env                   # Environment configurations
│   ├── server.js              # App bootstrap file
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.css            # Task dashboard component styles
    │   ├── App.jsx            # State management, Axios integrations & UI layout
    │   ├── index.css          # Design system variables, animations, scrollbars
    │   └── main.jsx           # React app entry point
    ├── index.html
    └── package.json
```

---

## Environment Variables (.env)

Create a `.env` file inside `backend/` with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/todo-db
NODE_ENV=development
```

- **PORT**: Port on which the Express backend server listens (default: `5000`).
- **MONGO_URI**: MongoDB connection URI. Connects to the local MongoDB service by default.
- **NODE_ENV**: Server mode (e.g. `development` or `production` to hide/show error stack traces).

---

## Setup & Running Instructions

### Prerequisites
- Node.js (v16.x or higher recommended)
- MongoDB running locally (default port `27017`) or a MongoDB Atlas URI.

### 1. Run the Backend API
1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the backend in development hot-reload mode:
   ```bash
   npm run dev
   ```
   The backend will bootstrap and connect to MongoDB:
   ```
   🚀 Task Backend running in development mode
   📡 URL: http://localhost:5000
   MongoDB Connected: localhost
   ```

### 2. Run the React Frontend
1. Open a second terminal window and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   Vite will serve the page at:
   ```
   Local:   http://localhost:5173/
   ```
4. Open `http://localhost:5173/` in your browser.

---

## Challenges and Resolutions

### 1. Database Integration & Schema Consistency
*   **Challenge**: Adapting the previous in-memory uuid-based task system to MongoDB ObjectId without breaking backend logic.
*   **Resolution**: Implemented Mongoose schemas using automatic document creation properties like `timestamps: true` (creating `createdAt` and `updatedAt` properties automatically) and handled potential casting errors when an invalid ObjectId format is requested. The centralized error handling middleware catches these Mongoose `CastError` exceptions and sends a clean `400 Bad Request` with an `Invalid ID format` message instead of crashing the server.

### 2. Design Architecture (Controller-Service-Routes)
*   **Challenge**: Avoiding code clutter in the controllers where databases queries and validation checks were previously performed.
*   **Resolution**: Separated responsibilities strictly:
    - **Routes** (`taskRoutes.js`) only define endpoint patterns and associate validator middlewares.
    - **Middlewares** (`validationMiddleware.js`) parse req payloads, ensuring inputs conform to schema types (e.g. titles must be strings and cannot be empty) before routing them forward.
    - **Controllers** (`taskController.js`) parse URL path params or queries, delegate business logic to the service class, and determine HTTP status responses.
    - **Services** (`taskService.js`) interface directly with Mongoose queries and handle sorting or filtering regex tasks.

### 3. Asynchronous API Latency & UI Smoothness
*   **Challenge**: While status toggles require a server patch call, showing a loading indicator or waiting for the API round-trip would make the UI feel sluggish.
*   **Resolution**: Implemented **optimistic UI updates** for the status toggle micro-interaction. The task status transitions instantly in the React state while the Axios request resolves in the background. If the request fails, the state reverts back to its previous status and triggers a red error toast.

### 4. Search Query DB Throttling
*   **Challenge**: Querying the database on every keypress inside the search input would flood the MongoDB database and degrade app performance.
*   **Resolution**: Integrated a **debouncing hook** inside the React client. When typing, database queries are held back until a 350ms pause is detected, reducing server load dramatically.

### 5. CORS Policies
*   **Challenge**: Browser CORS policies blocked the React application (`localhost:5173`) from sending headers to the API backend (`localhost:5000`).
*   **Resolution**: Configured Express CORS middleware (`cors` package) to whitelist cross-origin calls, permitting headers and request methods (GET, POST, PUT, PATCH, DELETE).
