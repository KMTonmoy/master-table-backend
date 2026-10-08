import { isDbReady } from "../config/db.js";

export const dbReady = (req, res, next) => {
  if (!isDbReady()) {
    return res.status(500).json({
      success: false,
      message:
        "Database is not configured. Set DB_URI in environment variables.",
    });
  }
  next();
};