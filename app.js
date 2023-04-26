var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

// Route files
const auth = require("./routes/auth");
const groups = require("./routes/groups");
const dm = require("./routes/dm")
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

var app = express();
app.use(cors()); // add this line

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Mount routers
app.use("/api/v1/auth", auth);
app.use("/api/v1/groups", groups);
app.use("/api/v1/dm", dm);

module.exports = app;
