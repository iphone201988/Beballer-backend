import "dotenv/config";
import {connectDb} from "./utils/helper";
import app from "./app";

connectDb()
  .then(() => {
    console.log("Connected to DB successfully", process.env.MONGO_URI);
    app.listen(9000, () => {
      console.log(`Server is running on port: 9000`);
    });
  })
  .catch((error) => {
    console.log("Error connecting to DB", error);
  });
