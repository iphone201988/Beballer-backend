import { connect } from "mongoose";
import app from "./app";
import {connectDb} from "./utils/helper";

const port = process.env.PORT || 3000;

connectDb().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port `,`http://localhost:${port}`);
    });
});

