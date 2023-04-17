const express = require("express");
const cors = require("cors");
require("dotenv").config()
const { connection } = require("./db");
const app = express();
const { userRouter } = require("./routes/UserRoutes")
const { authentication } = require("./middleware/authentication");
const { KanbanRoutes } = require("./routes/KanbanRoutes");
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Welcome To The Home Page");
})


app.use("/", userRouter)
app.use(authentication);
app.use("/", KanbanRoutes)

app.listen(8080, async () => {
    console.log(`The app should be runing in ${8080}`);
    try {
        await connection;
        console.log("DB is connected");
    }
    catch (err) {
        console.log(err.message)
    }
})