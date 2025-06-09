import express,{ Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import { errorMiddleware } from "./middleware/error.middleware";
import router from "./routes/route";
const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1", router);

app.use("/*", (req:Request, res:Response) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
  });
});

app.use(errorMiddleware);
export default app;
