# Deployment Guide: Microservices Architecture

This guide provides detailed instructions on how to deploy the `frontend`, `backend`, and `service` components of this application as separate microservices.

## Architecture Overview

The application is divided into three services:

1.  **`frontend`**: A React-based user interface.
2.  **`backend`**: A Node.js/Express API that serves the frontend.
3.  **`service`**: A Node.js background service for monitoring websites.

Each service will be deployed independently and will communicate with the others over the network.

---

## 1. Backend Service (`backend`)

The backend is the central API for the application.

### CORS Configuration

When the frontend is deployed on a different domain, you must configure Cross-Origin Resource Sharing (CORS) in the backend to accept requests from the frontend.

-   **File to Modify**: `/home/user/server/backend/src/app.js`
-   **Action**: Update the CORS configuration to allow your frontend's domain.

**Replace the existing `app.use(cors())` and the manual `res.setHeader` calls with this:**

```javascript
// In /home/user/server/backend/src/app.js

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000', // Your frontend URL
    credentials: true
}));
```

### Environment Variables

Create a `.env` file in the `/home/user/server/backend` directory for production and set the following variables:

```
PORT=8080
DATABASE_URL=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
CORS_ORIGIN=<your_deployed_frontend_url>
```

### Deployment

1.  **Choose a Platform**: Select a cloud provider that supports Node.js (e.g., Heroku, AWS Elastic Beanstalk, Google App Engine).
2.  **Push to Git**: Push your code to a GitHub or GitLab repository.
3.  **Create Application**: Create a new application on your chosen platform and connect it to your Git repository.
4.  **Configure Environment Variables**: Add the environment variables listed above in your platform's settings.
5.  **Deploy**: Trigger a deployment. Your backend API will be available at the URL provided by the platform.

---

## 2. Frontend Service (`frontend`)

The frontend is the user-facing part of your application.

### Connecting to the Backend

You need to tell the frontend the URL of your deployed backend API.

-   **File to Create/Modify**: `/home/user/server/frontend/.env.production`
-   **Action**: Add the following line to this file.

```
VITE_API_BASE_URL=<your_deployed_backend_url>/api/v1
```

**Note**: Replace `<your_deployed_backend_url>` with the actual URL of your deployed backend service.

### Deployment

1.  **Choose a Platform**: Select a static hosting provider (e.g., Vercel, Netlify, AWS S3).
2.  **Push to Git**: Push your code to a GitHub or GitLab repository.
3.  **Create Project**: Create a new project on your chosen platform and connect it to your Git repository.
4.  **Configure Environment Variables**: Add the `VITE_API_BASE_URL` environment variable in your platform's settings.
5.  **Build Settings**:
    -   **Build Command**: `npm run build` (or `yarn build`)
    -   **Publish Directory**: `dist`
6.  **Deploy**: Trigger a deployment. Your frontend will be available at the URL provided by the platform.

---

## 3. Monitoring Service (`service`)

The monitoring service runs as a background job.

### Environment Variables

Create a `.env` file in the `/home/user/server/service` directory for production and set the following variables:

```
PORT=8081
DATABASE_URL=<your_mongodb_connection_string>
EMAIL_HOST=<your_email_server_host>
EMAIL_PORT=<your_email_server_port>
EMAIL_USER=<your_email_server_username>
EMAIL_PASS=<your_email_server_password>
```

**Note**: The `DATABASE_URL` should be the same as the one used for the backend service.

### Deployment

1.  **Choose a Platform**: Select a cloud provider that supports Node.js (e.g., Heroku, AWS, Google Cloud).
2.  **Push to Git**: Push your code to a GitHub or GitLab repository.
3.  **Create Application**: Create a new application on your chosen platform and connect it to your Git repository.
4.  **Configure Environment Variables**: Add the environment variables listed above in your platform's settings.
5.  **Deploy**: Trigger a deployment.

---

## Summary of URL and API Key Changes

-   **Frontend**: The backend API URL is set in `/home/user/server/frontend/.env.production` through the `VITE_API_BASE_URL` variable.
-   **Backend**: The allowed frontend URL for CORS is set in `/home/user/server/backend/.env` through the `CORS_ORIGIN` variable.
-   **Service**: This service does not directly communicate with the frontend or backend via API calls, but it shares the same database. Ensure the `DATABASE_URL` is correctly configured. Email credentials are set in `/home/user/server/service/.env`.
