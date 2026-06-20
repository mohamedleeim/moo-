import express from "express";
import fs from "fs";
import path from "path";
import os from "os";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  // Storage file path for projects database (Documents directory)
  const HOME_DIR = os.homedir();
  const DB_DIR = path.join(HOME_DIR, "Documents", "AlBahia_Metre");
  const DB_FILE = path.join(DB_DIR, "projects_db.json");

  // Ensure documents subdirectory directory exists
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  } catch (err) {
    console.error("Could not create Documents/AlBahia_Metre directory, using current directory instead:", err);
  }

  // Backup file path in case standard is not writable
  const ACTUAL_DB_FILE = fs.existsSync(DB_DIR) ? DB_FILE : path.join(process.cwd(), "projects_db.json");

  // Middlewares
  app.use(express.json({ limit: "150mb" }));
  app.use(express.urlencoded({ limit: "150mb", extended: true }));

  // API: Get all projects
  app.get("/api/projects", (req, res) => {
    try {
      if (fs.existsSync(ACTUAL_DB_FILE)) {
        const fileContent = fs.readFileSync(ACTUAL_DB_FILE, "utf-8");
        const data = JSON.parse(fileContent);
        return res.json({ success: true, data });
      } else {
        // Return success with empty list if the database file does not exist yet
        return res.json({ success: true, data: [] });
      }
    } catch (error: any) {
      console.error("Error reading projects database:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // API: Save all projects
  app.post("/api/projects", (req, res) => {
    try {
      const projects = req.body;
      if (!Array.isArray(projects)) {
        return res.status(400).json({ success: false, error: "Invalid data format. Expected an array of projects." });
      }

      fs.writeFileSync(ACTUAL_DB_FILE, JSON.stringify(projects, null, 2), "utf-8");
      return res.json({ success: true, message: "Data saved successfully to computer." });
    } catch (error: any) {
      console.error("Error writing to projects database:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Node Server running on http://localhost:${PORT}`);
    console.log(`Database Local path: ${DB_FILE}`);
  });
}

startServer();
