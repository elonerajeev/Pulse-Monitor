# PulseMonitor: Ultra Low-Cost AWS Deployment Guide

This guide outlines the most cost-effective strategy for deploying the PulseMonitor application (frontend, backend, and monitoring service) on Amazon Web Services (AWS). The architecture relies heavily on serverless technologies to maximize the use of the AWS Free Tier and minimize costs for low-to-moderate traffic.

**Core Principle:** Avoid always-on servers. Use pay-per-use services.

---

## Part 1: Deploying the Frontend (`frontend`)

The frontend is a static React application. The cheapest and most scalable way to host this is using **AWS S3** for storage and **AWS CloudFront** as a global Content Delivery Network (CDN).

-   **Services Used:**
    -   **AWS S3 (Simple Storage Service):** To store the built static files (HTML, CSS, JS).
    -   **AWS CloudFront:** To distribute the application globally, provide HTTPS, and improve performance.
-   **Cost-Effectiveness:** Both S3 and CloudFront have generous permanent free tiers. For a small-to-medium application, your hosting costs will likely be **$0**.

### Deployment Steps:

1.  **Build the Frontend:**
    -   Navigate to the `frontend` directory and run `npm run build`. This will create a `dist` folder containing your static application.

2.  **Create and Configure S3 Bucket:**
    -   Go to the AWS S3 console and create a new bucket (e.g., `pulsemonitor-frontend-app`).
    -   **Important:** Uncheck "Block all public access" during creation. You will control access via CloudFront later.
    -   Upload the entire contents of the `frontend/dist` directory into the S3 bucket.
    -   In the bucket's **Properties** tab, enable "Static website hosting." Note the bucket website endpoint for the next step.

3.  **Create a CloudFront Distribution:**
    -   Go to the AWS CloudFront console and click "Create Distribution."
    -   **Origin Domain:** Select your S3 bucket from the dropdown.
    -   **S3 bucket access:** Select "Yes, use OAI (Origin Access Identity)" to ensure the bucket is only accessible via CloudFront. Create a new OAI if you don't have one.
    -   **Viewer Protocol Policy:** Redirect HTTP to HTTPS.
    -   **Default Root Object:** Set this to `index.html`.
    -   Click **Create Distribution**. After it's deployed (~15 mins), you will get a CloudFront domain name (e.g., `d123xyz.cloudfront.net`). This is your new frontend URL.

---

## Part 2: Deploying the Backend (`backend`)

The backend is a Node.js API. Instead of running it on a costly 24/7 server (like EC2), we will deploy it as a serverless function using **AWS Lambda** and expose it to the internet via **API Gateway**.

-   **Services Used:**
    -   **AWS Lambda:** To run the backend code in response to triggers.
    -   **API Gateway:** To create a public HTTP endpoint and route requests to the Lambda function.
-   **Cost-Effectiveness:** The AWS Free Tier includes **1 million Lambda invocations** and **1 million API Gateway calls** per month, forever. This is more than enough for most small applications, making your backend costs **$0**.

### Deployment Steps:

1.  **Package the Backend:**
    -   Navigate to the `backend` directory.
    -   Install production dependencies: `npm install --production`.
    -   Create a `.zip` file containing all the backend files, including the `node_modules` folder.

2.  **Create a Lambda Function:**
    -   Go to the AWS Lambda console and click "Create function."
    -   Select "Author from scratch."
    -   **Function name:** `pulse-monitor-backend-api`.
    -   **Runtime:** Select a recent Node.js version (e.g., Node.js 18.x or newer).
    -   Click **Create function**.

3.  **Configure the Lambda:**
    -   In the "Code source" section, click **Upload from** and select the `.zip` file you created.
    -   Go to the **Configuration > Environment variables** tab. Add all the necessary variables your backend needs (`MONGO_URI`, `ACCESS_TOKEN_SECRET`, etc.), just as you did on Render.
    -   **Important:** Increase the **Timeout** under **Configuration > General configuration** from the default 3 seconds to **30 seconds** to avoid request timeouts.

4.  **Create the API Gateway Trigger:**
    -   In the Lambda function overview, click **Add trigger**.
    -   Select **API Gateway**.
    -   Choose "Create a new API."
    -   **API type:** `HTTP API`.
    -   **Security:** `Open`.
    -   Click **Add**. You will now have a public API endpoint URL. This is your new backend URL.

---

## Part 3: Deploying the Monitoring Service (`service`)

The monitoring service is a background worker that needs to run on a schedule. The most cost-effective way to achieve this on AWS is with a Lambda function triggered by **Amazon EventBridge**.

-   **Services Used:**
    -   **AWS Lambda:** To run the monitoring script.
    -   **Amazon EventBridge (CloudWatch Events):** To trigger the Lambda function on a recurring schedule (e.g., every 5 minutes).
-   **Cost-Effectiveness:** This uses the same Lambda free tier as the backend. Since you control how often it runs, the cost will be predictable and almost certainly **$0**.

### Deployment Steps:

1.  **Package the Service:**
    -   Similar to the backend, navigate to the `service` directory, run `npm install --production`, and create a `.zip` file of the directory contents.

2.  **Create a Lambda Function:**
    -   Go to the Lambda console and create another function (e.g., `pulse-monitor-worker`).
    -   Use the same Node.js runtime as before.
    -   Upload the `service` `.zip` file.
    -   Add the required environment variables for the service in the **Configuration** tab.
    -   Set the **Timeout** to be longer than your monitoring job's expected runtime (e.g., 1-5 minutes).

3.  **Create the EventBridge Schedule:**
    -   In the Lambda function overview, click **Add trigger**.
    -   Select **EventBridge (CloudWatch Events)**.
    -   Choose "Create a new rule."
    -   **Rule name:** `every-five-minutes`.
    -   **Schedule expression:** To run every 5 minutes, use `rate(5 minutes)`.
    -   Click **Add**.

Your monitoring service will now automatically execute every 5 minutes, completely for free within the free tier limits.
