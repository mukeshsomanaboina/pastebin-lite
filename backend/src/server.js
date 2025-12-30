import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import health from "./routes/health.js";
import pastes from "./routes/pastes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", health);
app.use("/api", pastes);
app.use("/", pastes);

app.listen(process.env.PORT, () => {
  console.log("Server running");
});
