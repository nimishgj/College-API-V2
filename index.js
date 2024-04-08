const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

const cookieParser = require("cookie-parser");

require("dotenv").config();

const {notFound} = require("./middleware/errorMiddleware");
const UserRoutes = require("./routes/UserRoutes");
const DocumentsRoutes = require("./routes/DocumentsRoutes");
const AdminRoutes = require("./routes/AdminRoutes");
const SchemeRoutes = require("./routes/SchemeRoutes");
const geoip = require("geoip-lite");
const useragent = require("express-useragent");
app.use(useragent.express());

const Database = require("./config/Database");
const {log} = require("./middleware/logger/logger");

const mongoUri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`

const db = new Database(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

db.connect().catch((err) =>
    console.error("Error connecting to database:", err)
);

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
//Routes
app.get("/", (request, response) => {
    log(request, "Server is UP and Running", "index.js", "api request", "info");

    response.status(200).send("Server is UP and Running");
});

app.use("/users", UserRoutes);
app.use("/Documents", DocumentsRoutes);
app.use("/Admin", AdminRoutes);
app.use("/Scheme", SchemeRoutes);

app.use(notFound);

app.listen(process.env.PORT, () => {
    try {
        console.log(
            "Server is running on port: ",
            process.env.PORT,
            "\nVersion 2.0 Powering Up\nPowered Up.."
        );
    } catch (error) {
        console.log(error);
    }
});
