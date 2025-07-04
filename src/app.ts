import express,{ Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import { errorMiddleware } from "./middleware/error.middleware";
import router from "./routes/route";
import updateEventDates from "./script/createdAt";
import updateContentTypeBulk from "./script/updatePostContenttype";
import main from "./script";
import updatePlayerAcceptance from "./script/updateGamesStatus";
const app = express();

app.use(express.json());
app.use(cors());

//  // run scripts
// updateEventDates();
// main();
// updateContentTypeBulk();
// updatePlayerAcceptance();

app.use("/api/v1", router);

app.use("/*", (req:Request, res:Response) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
  });
});

app.use(errorMiddleware);
export default app;
