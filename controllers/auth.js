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
        const hashedPassword = await bcrypt.hash(req.body.password, 10); // Using async function

        const user = await User.create({
            username: req.body.username,
            password: hashedPassword
        });

        res.send(`Thanks for signing up, ${user.username}`);
    } catch (error) {
        console.error("Error during sign-up:", error);
        res.send("An error occurred. Please try again.");
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

        console.log("Entered Password:", req.body.password);
        console.log("Stored Hashed Password:", userInDatabase.password);

        // Compare entered password with stored hashed password
        const passwordMatch = bcrypt.compare(req.body.password, userInDatabase.password);
        console.log("Password comparison result:", passwordMatch);

        if (!passwordMatch) {
            return res.send("Login failed. Incorrect password.");
        }

        // Store user session data
        req.session.user = {
            username: userInDatabase.username,
            _id: userInDatabase._id
        };

        // Ensure session is saved before redirecting
        req.session.save((err) => {
            if (err) console.error("Session save error:", err);
            res.redirect("/");
        });

    } catch (error) {
        console.error("Error during login:", error);
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