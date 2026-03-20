💸 FinanceSplit: Usage-Based Expense Management

Live: https://fsplitter-frontned.onrender.com/register

A professional MERN Stack application designed to simplify shared expenses, group finances, and usage-based cost tracking. Built with a focus on secure authentication and seamless production deployment.
🚀 Key Features
Secure Authentication: JWT-based login/signup with persistent sessions using LocalStorage.

Group Management: Create, Join, and Leave groups with role-based access (Admin/Member).

Usage-Based Tracking: Advanced logic for splitting costs based on individual usage.

Production Optimized: Fully configured for Render with client-side routing fallback rewrites.

Modern UI: Responsive dashboard with dark-themed aesthetics and fluid transitions.

🛠️ Tech Stack
Frontend: React.js, Tailwind CSS, Axios, React Router.

Backend: Node.js, Express.js.

Database: MongoDB Atlas (Mongoose).

Security: JSON Web Tokens (JWT), BcryptJS.

Deployment: Render (Frontend & Backend).

📦 Installation & Setup
Clone the repository:

Bash
git clone https://github.com/your-username/finance-splitter.git
cd finance-splitter
Backend Setup:

Create a .env file in the backend folder:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
Install dependencies and start:

Bash
npm install
npm start
Frontend Setup:

Create a .env file in the frontend folder:

Code snippet
REACT_APP_API_URL=http://localhost:5000
Install dependencies and start:

Bash
npm install
npm start
🛡️ Challenges Overcome
SPA Routing on Render: Resolved 404 errors on page refresh by implementing a custom _redirects configuration for static hosting.

Environment Sync: Synchronized JWT secrets across development and production environments to fix 401 Unauthorized bottlenecks.

State Persistence: Ensured robust user session management by sanitizing token storage and implementing fresh-fetch logic on the dashboard.
