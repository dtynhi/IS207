import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import multer from "multer";
import apiRouter from "./interfaces/http/routes";
import {
  errorHandler,
  notFoundHandler,
} from "./interfaces/http/middlewares/error-handler";

dotenv.config({
  path: process.env.ENV_FILE || path.resolve(process.cwd(), "backend/.env"),
});
dotenv.config();

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api", apiRouter);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Không tìm thấy file ảnh" });
  }
  const imageUrl = `http://localhost:4000/uploads/${req.file.filename}`;
  res.json({ success: true, url: imageUrl });
});

app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

app.use(notFoundHandler);
app.use(errorHandler);


export default app;
