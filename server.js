const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const session = require("express-session");
const isSignedIn = require("./middleware/is-signed-in.js");
const passUserToView = require("./middleware/pass-user-to-view.js");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const MongoStore = require("connect-mongo");

const app = express();

// use EJS as the viw engine
app.set('view engine', 'ejs');
// static file
app.use(express.static('public'));

// Port Configuration
const port = process.env.PORT || 3000;

// Database Connection
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});
mongoose.connection.on("error", (err) => {
    console.error(`MongoDB connection error: ${err.message}`);
});

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method", { methods: ["POST", "GET"] }));
app.use(morgan("dev"));
app.use(session({
    secret: process.env.SESSION_SECRET || "yourSecretKey",
    resave: false,
    saveUninitialized: false, // Prevents storing unnecessary empty sessions
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(passUserToView);

// Require Controllers
const authCtrl = require("./controllers/auth.js");
const employeesCtrl = require("./controllers/employees");

// Use Controllers
app.use("/auth", authCtrl);
app.use("/employees", isSignedIn, employeesCtrl);

// Root Route
app.get("/", async (req, res) => {
    res.render("index.ejs");
});

// Listen for HTTP Requests
app.listen(port, () => {
    console.log(`Server running on port ${port}!`);
});