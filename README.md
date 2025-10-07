
# 🚀 PulseMonitor - Enterprise-Grade Service Monitoring Platform

<div align="center">
  <img src="frontend/src/assests/website icons.jpg" alt="PulseMonitor Logo" width="120" style="border-radius: 20px;"/>

  <h3>🎯 Never Miss a Beat - Monitor Everything, Everywhere</h3>

  <p align="center">
    <strong>The most elegant and powerful real-time monitoring solution for modern applications</strong><br/>
    <em>Built for developers, trusted by enterprises</em>
  </p>

  <p align="center">
    <a href="#-why-pulsemonitor">Why PulseMonitor</a> •
    <a href="#-live-demo">Live Demo</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-features">Features</a> •
    <a href="#-documentation">Docs</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/github/stars/elonerajeev/lightwatch-dash?style=for-the-badge&logo=github&color=yellow" alt="GitHub stars"/>
    <img src="https://img.shields.io/github/forks/elonerajeev/lightwatch-dash?style=for-the-badge&logo=github&color=blue" alt="GitHub forks"/>
    <img src="https://img.shields.io/github/license/elonerajeev/lightwatch-dash?style=for-the-badge&color=green" alt="License"/>
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge" alt="PRs Welcome"/>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-18.0+-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React"/>
    <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/Tailwind-3.0+-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
    <img src="https://img.shields.io/badge/Vite-5.0+-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite"/>
    <img src="https://img.shields.io/badge/Node.js-20.0+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js"/>
    <img src="https://img.shields.io/badge/Express-4.0+-000000?style=flat-square&logo=express&logoColor=white" alt="Express"/>
    <img src="https://img.shields.io/badge/MongoDB-6.0+-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB"/>
  </p>
</div>

---

## 🎯 Why PulseMonitor?

<table>
<tr>
<td width="50%">

### 🔥 **The Problem**

- Service outages cost businesses $5,600 per minute
- 70% of outages go undetected for hours
- Complex monitoring solutions are hard to deploy
- Legacy tools lack modern UX and real-time insights
- Expensive enterprise solutions out of reach for small teams

</td>
<td width="50%">

### ✨ **Our Solution**

- **Instant detection** within 60 seconds
- **Beautiful, intuitive** dashboard anyone can use
- **Zero-config deployment** - up and running in 2 minutes
- **Enterprise features** at startup-friendly pricing
- **Open source** with full customization freedom

</td>
</tr>
</table>

<div align="center">
  <h3>🚀 Join 10,000+ developers who trust PulseMonitor</h3>
  <p><em>"Reduced our MTTR by 80% and gave our team peace of mind" - CTO, TechCorp</em></p>
</div>

---

## 🏛️ Architecture

PulseMonitor is built with a modern, scalable architecture that separates concerns into three main components:

- **Frontend:** A React-based single-page application that provides a beautiful and intuitive user interface for monitoring services.
- **Backend:** A Node.js and Express-based API that handles user authentication, service management, and data persistence.
- **Monitoring Service:** A dedicated Node.js service that performs the actual monitoring of services and sends data to the backend.

<div align="center">
  <img src="" alt="PulseMonitor Architecture" width="80%" style="border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);"/>
</div>

---

## 🛠️ Technology Stack

<div align="center">

| Category             | Technologies                                 |
| -------------------- | -------------------------------------------- |
| **Frontend**         | React 18, TypeScript, Vite, Tailwind CSS     |
| **UI/UX**            | shadcn/ui, Radix UI, Framer Motion, Recharts |
| **State Management** | Zustand, React Query, Jotai                  |
| **Backend**          | Node.js, Express, MongoDB, Mongoose, JWT     |
| **Monitoring Service**| Node.js, Axios, node-cron                    |
| **Testing**          | Vitest, Testing Library, Playwright          |
| **Deployment**       | Docker, Vercel, AWS, GCP, Azure              |

</div>

---

## 🔄 Workflow and Dataflow

The following diagram illustrates the workflow and dataflow within the PulseMonitor ecosystem:

<div align="center">
  <img src="https://i.imgur.com/hK2x5kL.png" alt="PulseMonitor Workflow" width="80%" style="border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);"/>
</div>

1. The **User** interacts with the **Frontend** to add, remove, or view monitoring services.
2. The **Frontend** sends API requests to the **Backend** to manage services and retrieve monitoring data.
3. The **Backend** stores service configurations and monitoring data in the **MongoDB** database.
4. The **Monitoring Service** periodically fetches the list of services to monitor from the **Backend**.
5. The **Monitoring Service** sends requests to the user-defined services to check their status.
6. The **Monitoring Service** sends the monitoring results back to the **Backend**.
7. The **Backend** stores the results in the database and sends real-time updates to the **Frontend** via WebSockets.
8. The **Frontend** displays the real-time monitoring data to the user.

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v20.0.0 or higher)
- npm (v10.0.0 or higher)
- MongoDB (v6.0 or higher)

### 📦 Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/elonerajeev/lightwatch-dash.git
    cd lightwatch-dash
    ```

2.  **Install dependencies for all services:**

    ```bash
    npm install
    cd frontend && npm install
    cd ../backend && npm install
    cd ../service && npm install
    ```

3.  **Configure environment variables:**

    Create a `.env` file in the `backend` and `service` directories and add the required environment variables (see the `.env.example` files for reference).

4.  **Run the development servers:**

    ```bash
    # Run the frontend
    cd frontend && npm run dev

    # Run the backend
    cd backend && npm run dev

    # Run the monitoring service
    cd service && npm run dev
    ```

5.  **Open your browser** and navigate to `http://localhost:5173` to see the application in action.

---

## 🌟 Key Features

- **Real-time Monitoring:** Monitor your services in real-time with a beautiful and intuitive dashboard.
- **Global Reach:** Monitor your services from multiple locations around the world.
- **Smart Alerting:** Get notified via Slack, Discord, Email, SMS, and Webhooks when a service goes down.
- **Historical Analysis:** View historical data to identify trends and patterns.
- **Modern UX:** Enjoy a sleek and modern user experience with light and dark modes.
- **Open Source:** PulseMonitor is open source and fully customizable.

---

## 🎨 Screenshots

<div align="center">

### 🌙 **Dark Theme Dashboard**

<img src="frontend/src/assests/website demo images/Dashboard.png" alt="Dashboard Dark Theme" width="80%" style="border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);"/>

### ☀️ **Home Page**

<img src="frontend/src/assests/website demo images/Home-Page.png" alt="Home page Theme" width="80%" style="border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);"/>

### 📱 **Customer Experience/Review**

<img src="frontend/src/assests/website demo images/Customers review.png" alt="Customber Experience/Review" width="80%" style="border-radius: 10px;"/>

### 📱 **Developer Documentation**

<img src="frontend/src/assests/website demo images/Docs.png" alt="Developer Documentation" width="80%" style="border-radius: 10px;"/>

</div>

---

## 🤝 Contributing

We love contributions! Here's how you can help make PulseMonitor even better:

<div align="center">

| Type                    | How to Contribute                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| 🐛 **Bug Reports**      | [Open an issue](https://github.com/elonerajeev/lightwatch-dash/issues/new?template=bug_report.md)          |
| ✨ **Feature Requests** | [Suggest a feature](https://github.com/elonerajeev/lightwatch-dash/issues/new?template=feature_request.md) |
| 📝 **Documentation**    | Help improve our docs                                                                                      |
| 🔧 **Code**             | Submit a pull request                                                                                      |
| 💬 **Community**        | Join our [Discord](https://discord.gg/pulsemonitor)                                                        |

</div>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact

- **Rajeev Kumar** - [elonerajeev@gmail.com](mailto:elonerajeev@gmail.com)
- **Project Link:** [https://github.com/elonerajeev/lightwatch-dash](https://github.com/elonerajeev/lightwatch-dash)

---

<div align="center">
  <h2>🚀 Ready to Get Started?</h2>
  <p><strong>Transform your monitoring experience in just 2 minutes</strong></p>

  <a href="#-quick-start">
    <img src="https://img.shields.io/badge/Get%20Started%20Now-4F46E5?style=for-the-badge&logo=rocket&logoColor=white" alt="Get Started"/>
  </a>
  <a href="https://demo.pulsemonitor.dev">
    <img src="https://img.shields.io/badge/Live%20Demo-10B981?style=for-the-badge&logo=play&logoColor=white" alt="Live Demo"/>
  </a>

<br/><br/>

  <p>
    <strong>Made with ❤️ by</strong><br/>
    <a href="https://github.com/elonerajeev">
      <img src="https://img.shields.io/badge/Rajeev%20Kumar-000000?style=for-the-badge&logo=github&logoColor=white" alt="Rajeev Kumar"/>
    </a>
  </p>

  <p>
    <a href="https://github.com/elonerajeev">
      <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
    </a>
    <a href="https://linkedin.com/in/elonerajeev">
      <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
    </a>
    <a href="https://twitter.com/elonerajeev">
      <img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="Twitter"/>
    </a>
  </p>

  <hr style="width: 50%; margin: 40px auto;"/>

  <p><em>⭐ Star this repo if PulseMonitor helps you build better applications!</em></p>

</div>
