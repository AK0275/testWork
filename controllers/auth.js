const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");

// Sign-Up Page
router.get("/sign-up", (req, res) => {
    res.render("auth/sign-up.ejs");
});

// Handle Sign-Up
router.post("/sign-up", async (req, res) => {
    try {
        const userInDatabase = await User.findOne({ username: req.body.username });
        if (userInDatabase) {
            return res.send("Username already taken.");
        }

        if (req.body.password !== req.body.confirmPassword) {
            return res.send("Password and Confirm Password must match.");
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword;

        const user = await User.create(req.body);
        res.redirect("/auth/sign-in");
    } catch (error) {
        console.log(error);
    }
});

// Sign-In Page
router.get("/sign-in", (req, res) => {
    res.render("auth/sign-in.ejs");
});

// Handle Sign-In
router.post("/sign-in", async (req, res) => {
    try {
        const userInDatabase = await User.findOne({ username: req.body.username });
        if (!userInDatabase) {
            return res.send("Login failed. Username not found.");
        }

        const passwordMatch = await bcrypt.compare(req.body.password, userInDatabase.password);
        if (!passwordMatch) {
            return res.send("Login failed. Incorrect password.");
        }

        req.session.user = {
            username: userInDatabase.username,
            _id: userInDatabase._id
        };

        req.session.save(() => {
            res.redirect("/");
        });

    } catch (error) {
        console.log(error);
        res.send("An error occurred. Please try again.");
    }
});

// Handle Sign-Out
router.get("/sign-out", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

module.exports = router;