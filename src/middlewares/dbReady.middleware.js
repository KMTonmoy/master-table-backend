import { isDbReady, connectDB } from "../config/db.js";

export const dbReady = async (req, res, next) => {
  if (!isDbReady()) {
    try {
      await connectDB();
    } catch (err) {
      console.error("DB reconnect failed:", err.message);
    }
  }

  if (!isDbReady()) {
    return res.status(503).json({
      success: false,
      message:
        "Database is not available. Check DB_URI and your MongoDB network access settings.",
    });
  }

  next();
};