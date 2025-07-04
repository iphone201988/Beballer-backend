import express,{ Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import { errorMiddleware } from "./middleware/error.middleware";
import { Server } from "socket.io";
import http from "http";
import router from "./routes/route";
import useSocket from "./sockets";
import updateEventDates from "./script/createdAt";
import updateContentTypeBulk from "./script/updatePostContenttype";
import main from "./script";
import updatePlayerAcceptance from "./script/updateGamesStatus";
// import updatePostDescription from "./script/updatePostDescription";
const app = express();
const server = http.createServer(app);
const io = new Server(server);

useSocket(io);
app.use(express.json());
app.use(cors());

//  // run scripts
// updateEventDates();
// main();
// updateContentTypeBulk();
// updatePlayerAcceptance();
// updatePostDescription();

app.use("/api/v1", router);

app.use("/*", (req:Request, res:Response) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
  });
});

app.use(errorMiddleware);
export default server;
