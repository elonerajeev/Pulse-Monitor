# Application Documentation

## 1. Application Overview

This application is a web service monitoring tool called **PulseMonitor**. It allows users to monitor the status of their websites and servers, receive alerts, and view uptime history.

The architecture is composed of three main parts:

*   **Frontend:** A React single-page application (SPA) that provides the user interface.
*   **Backend:** A Node.js/Express API that handles user management, authentication, and data operations.
*   **Service:** A background Node.js service that performs the actual monitoring checks and sends notifications.

## 2. Architecture & Data Flow

The application follows a standard client-server model with a decoupled background service for asynchronous tasks.

1.  **User Interaction:** The user interacts with the **Frontend** in their browser.
2.  **API Communication:** The **Frontend** communicates with the **Backend** via a RESTful API to register, log in, and manage monitoring services (CRUD operations).
3.  **Authentication:** The **Backend** uses JSON Web Tokens (JWT) for securing its endpoints. The token is stored in the browser's local storage on the frontend.
4.  **Data Storage:** The **Backend** uses a MongoDB database to store user data, monitoring configurations, and logs.
5.  **Monitoring Execution:** The **Service** runs independently. Every 5 minutes, it fetches all monitoring tasks from the database.
6.  **Health Checks:** For each task, the **Service** sends a request to the target URL/server to check its status (online, offline, response time).
7.  **Logging & Alerts:** The result of each check is saved as a `MonitoringLog` in the database. If a status change is detected (e.g., a service goes down), the **Service** sends an email alert to the user and creates an in-app notification.
8.  **Dashboard Display:** When the user views their dashboard on the **Frontend**, it fetches the latest monitoring data and logs from the **Backend** to display the current status and historical charts.

## 3. Core Features

*   **User Authentication:** Secure user registration and login.
*   **Service Monitoring:** Add, view, edit, and delete services to monitor (websites or servers).
*   **Real-time Dashboard:** View the current status, uptime percentage, and average response time of all monitored services.
*   **Historical Data:** See charts of response times and logs of past events for each service.
*   **Email & In-App Alerts:** Receive notifications when a monitored service goes down or comes back up.

## 4. Project Structure & Key Files

This section highlights the most important files and directories for understanding and modifying the application.

### Frontend (`/frontend`)

*   **`/src/pages/`**: Contains the main page components.
    *   `Dashboard.tsx`: The main dashboard view after a user logs in. Fetches and displays all monitoring data.
    *   `Auth/Login.tsx` & `Auth/Signup.tsx`: Handle user login and registration forms and API calls.
    *   `AddMonitoringService.tsx`: The form for adding a new service to monitor.
*   **`/src/components/`**: Contains reusable UI components used across different pages (e.g., `Navbar`, `Button`, `Card`).
*   **`/src/utils/api.ts`**: Defines the base URL for the backend API.
*   **How to Make Changes:** To modify the UI, you will primarily edit the files in `/src/pages/` and `/src/components/`. API interactions are handled directly within the page components using `fetch`.

### Backend (`/backend`)

*   **`/src/routes/`**: Defines the API endpoints.
    *   `auth.routes.js`: Routes for user registration and login.
    *   `monitoring.routes.js`: CRUD routes for the monitoring services.
*   **`/src/controllers/`**: Contains the business logic for each API endpoint.
    *   `auth.controller.js`: Logic for user registration and login.
    *   `monitoring.controller.js`: Logic for creating, reading, updating, and deleting monitoring services.
*   **`/src/models/`**: Defines the Mongoose schemas for the database.
    *   `user.model.js`: User schema.
    *   `monitoring.model.js`: Monitoring service schema.
    *   `monitoring_log.model.js`: Log schema for each check.
*   **`/src/middlewares/auth.middleware.js`**: Contains the `verifyJWT` middleware used to protect secure routes.
*   **How to Make Changes:** To add a new API endpoint, create a new route in a file in `/src/routes/`, implement its logic in a controller in `/src/controllers/`, and if necessary, define a new data model in `/src/models/`.

### Service (`/service`)

*   **`/src/index.js`**: The entry point for the service, which starts the cron job.
*   **`/src/jobs/monitorJob.js`**: Contains the main cron job logic that schedules and executes the monitoring checks every 5 minutes.
*   **`/src/services/monitoringService.js`**: Contains the core logic for fetching services from the DB, performing the health check, saving the results, and triggering alerts.
*   **`/src/monitor.js`**: (Inferred) Contains the function that actually performs the HTTP request to check a target service.
*   **How to Make Changes:** To change the monitoring interval, modify the cron schedule in `monitorJob.js`. To alter how a service is checked (e.g., check for specific content), modify the `monitorWebsite` function.

## 5. API Documentation

The API base path is `/api/v1`.

### Authentication API

#### `POST /auth/register`

*   **Description:** Registers a new user.
*   **Request Body:**
    ```json
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "password": "password123",
      "confirmPassword": "password123"
    }
    ```
*   **Response (Success):**
    ```json
    {
      "statusCode": 201,
      "data": {
        "user": {
          "_id": "...",
          "name": "John Doe",
          "email": "john.doe@example.com"
        },
        "accessToken": "..."
      },
      "message": "User registered successfully"
    }
    ```

#### `POST /auth/login`

*   **Description:** Logs in an existing user.
*   **Request Body:**
    ```json
    {
      "email": "john.doe@example.com",
      "password": "password123"
    }
    ```
*   **Response (Success):**
    ```json
    {
      "statusCode": 200,
      "data": {
        "user": {
          "_id": "...",
          "name": "John Doe",
          "email": "john.doe@example.com"
        },
        "accessToken": "..."
      },
      "message": "User logged in successfully"
    }
    ```

### Monitoring API

*All endpoints require an `Authorization: Bearer <token>` header.*

#### `POST /monitoring`

*   **Description:** Creates a new monitoring service.
*   **Request Body:**
    ```json
    {
      "name": "My Website",
      "target": "https://example.com",
      "serviceType": "website",
      "interval": 5
    }
    ```
*   **Response (Success):**
    ```json
    {
      "statusCode": 201,
      "data": { ... }, // The created monitoring object
      "message": "Monitoring service created successfully"
    }
    ```

#### `GET /monitoring`

*   **Description:** Retrieves all monitoring services for the logged-in user, along with their recent logs.
*   **Request Body:** None
*   **Response (Success):**
    ```json
    {
      "statusCode": 200,
      "data": [ ... ], // An array of monitoring service objects
      "message": "Monitoring services retrieved successfully"
    }
    ```

#### `PATCH /monitoring/:id`

*   **Description:** Updates a monitoring service.
*   **Request Body:**
    ```json
    {
      "name": "My Updated Website",
      "target": "https://new-example.com",
      "interval": 10
    }
    ```
*   **Response (Success):**
    ```json
    {
      "statusCode": 200,
      "data": { ... }, // The updated monitoring object
      "message": "Monitoring service updated successfully"
    }
    ```

#### `DELETE /monitoring/:id`

*   **Description:** Deletes a monitoring service and all its associated logs.
*   **Request Body:** None
*   **Response (Success):**
    ```json
    {
      "statusCode": 200,
      "data": {},
      "message": "Monitoring service deleted successfully"
    }
    ```

### Health Check API

#### `GET /healthcheck`

*   **Description:** A public endpoint to verify that the backend server is running.
*   **Request Body:** None
*   **Response (Success):**
    ```json
    {
      "status": "success",
      "message": "Server is healthy",
      "timestamp": "..."
    }
    ```
