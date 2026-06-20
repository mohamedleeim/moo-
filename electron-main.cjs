const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const express = require("express");

let mainWindow;
let expressApp;
let serverInstance;

// Determine paths
const PORT = 3000;
const USER_DOCUMENTS = app.getPath("documents");
const DB_DIR = path.join(USER_DOCUMENTS, "AlBahia_Metre");
const DB_FILE = path.join(DB_DIR, "projects_db.json");

// Ensure the directory exists
try {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
} catch (e) {
  console.error("Error creating documents directory:", e);
}

// Set up the local Express API server inside Electron for local storage persistence
function startLocalExpressServer() {
  expressApp = express();
  expressApp.use(express.json({ limit: "150mb" }));
  expressApp.use(express.urlencoded({ limit: "150mb", extended: true }));

  // API: Get all projects
  expressApp.get("/api/projects", (req, res) => {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        const data = JSON.parse(fileContent);
        return res.json({ success: true, data });
      } else {
        return res.json({ success: true, data: [] });
      }
    } catch (error) {
      console.error("Error reading projects database:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // API: Save all projects
  expressApp.post("/api/projects", (req, res) => {
    try {
      const projects = req.body;
      if (!Array.isArray(projects)) {
        return res.status(400).json({ success: false, error: "Invalid data format." });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(projects, null, 2), "utf-8");
      return res.json({ success: true, message: "Sauvegardé avec succès dans Documents/AlBahia_Metre/projects_db.json." });
    } catch (error) {
      console.error("Error writing database:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Serve static files in production
  const distPath = path.join(__dirname, "dist");
  if (fs.existsSync(distPath)) {
    expressApp.use(express.static(distPath));
    expressApp.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  serverInstance = expressApp.listen(PORT, "127.0.0.1", () => {
    console.log(`Port ${PORT} bound inside Electron.`);
    console.log(`Your projects database is synced at: ${DB_FILE}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "مترور المغرب - Révision de prix & Métré d'exécution",
    icon: path.join(__dirname, "assets", "icon.png"), // fallbacks if exists
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the running server
  mainWindow.loadURL(`http://localhost:${PORT}`);

  // Auto-hide top menu bar
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startLocalExpressServer();
  // Small delay to ensure port binding is complete before window opens
  setTimeout(createWindow, 500);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (serverInstance) {
      serverInstance.close();
    }
    app.quit();
  }
});
