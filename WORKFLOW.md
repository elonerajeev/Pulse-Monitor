
# Internal Workflow for Monitoring

This document explains the internal workflow of how a user's request to monitor a new website or service is processed within the system.

## High-Level Diagram

```
[User] --> [Frontend] --> [Backend] --> [Database] --> [Monitoring Service]
   |           |             |             |                  |
   |           |             |             |                  |
   1. Fill Form|             |             |                  |
   |           |             |             |                  |
   +--------> 2. POST /api/monitoring |             |                  |
               |             |             |                  |
               +-----------> 3. Validate & Save |                  |
                             |             |                  |
                             +-----------> 4. Store Monitoring Job |
                                           |                  |
                                           +----------------> 5. Pick up Job & Monitor
```

## Step-by-Step Explanation

### 1. User Fills the Monitoring Form (Frontend)

-   **Component:** Frontend (React)
-   **File:** `frontend/src/pages/AddMonitoringService.tsx`
-   **Action:** The user navigates to the "Add Monitoring" page and fills out the form with details like the website URL, monitoring frequency, etc.

### 2. Submitting the Form (Frontend to Backend)

-   **Component:** Frontend (React)
-   **File:** `frontend/src/utils/api.ts`
-   **Action:** When the user submits the form, the frontend application makes a `POST` request to the backend API endpoint, likely `/api/monitoring`. The data from the form is sent as a JSON payload in the request body.

### 3. Backend Processing (Backend)

-   **Component:** Backend (Node.js/Express)
-   **Files:**
    -   `backend/src/routes/monitoring.routes.js` (Defines the API route)
    -   `backend/src/controllers/monitoring.controller.js` (Handles the request)
    -   `backend/src/models/monitoring.model.js` (Mongoose model for the data)
-   **Action:**
    1.  The backend receives the `POST` request.
    2.  The `auth.middleware.js` middleware verifies the user's authentication token.
    3.  The `monitoring.controller.js` validates the incoming data (e.g., checking if the URL is valid).
    4.  If the data is valid, a new document is created using the `monitoring.model.js` and saved to the database.

### 4. Storing the Monitoring Job (Database)

-   **Component:** Database (MongoDB)
-   **Action:** The backend saves the new monitoring job details into the `monitorings` collection in the MongoDB database. This record includes the URL to be monitored, the frequency, the user who created it, and other relevant details.

### 5. The Monitoring Service (Service)

-   **Component:** Monitoring Service (Node.js)
-   **Files:**
    -   `service/src/jobs/monitorJob.js` (The core job that runs periodically)
    -   `service/src/services/monitoringService.js` (Fetches jobs and pings URLs)
-   **Action:**
    1.  A cron job, defined in `service/src/jobs/monitorJob.js`, runs at a regular interval (e.g., every minute).
    2.  The job calls the `monitoringService.js` to fetch all the monitoring jobs from the database.
    3.  For each job, the service makes an HTTP request to the specified URL to check its status (up or down).
    4.  The result of the check (status code, response time, etc.) is saved as a log in the `monitoring_logs` collection in the database.
    5.  If the website is down, the `alertService.js` might be triggered to send a notification to the user (e.g., via email or other channels).

This entire process, from the user's form submission to the continuous monitoring of their website, is designed to be automated and scalable.
