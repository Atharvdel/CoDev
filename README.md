![logo](https://github.com/re-fract/SynCode/blob/main/client/public/syncode.png)

A collaborative, real-time code editor where users can seamlessly code together. It provides a platform for multiple users to enter a room, share a unique room ID, and collaborate on code simultaneously.

## 🔮 Features

- 💻 Real-time collaboration on code editing across multiple files
- 🚀 Unique room generation with room ID for collaboration
- 🌍 Comprehensive language support for versatile programming
- 🚀 Code Execution: Users can execute the code directly within the collaboration environment
- 📣 Notifications for user join and leave events
- 👥 User presence list with online/offline status indicators

## 🚀 Live Preview

You can view the live preview of the project [here](https://syn-code-one.vercel.app/).

## ⚙️ Installation

### Manual Installation

1. **Fork this repository:** Click the Fork button located in the top-right corner of this page.
2. **Clone the repository:**
   ```bash
   git clone https://github.com/re-fract/SynCode.git
   ```
3. **Create .env file:**
   Inside the client and server directories create `.env` and set:

   Frontend:

   ```bash
   REACT_APP_SERVER_URL=http://localhost:5000
   ```

   Backend:

   ```bash
   PORT=3000
   ```

4. **Install dependencies:**
   ```bash
   npm install     # Run in both client and server directories
   ```
5. **Start the servers:**
   Frontend:
   ```bash
   cd client
   npm start
   ```
   Backend:
   ```bash
   cd server
   npm start
   ```
6. **Access the application:**
   ```bash
   http://localhost:3000/
   ```
