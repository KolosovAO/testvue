const express = require("express");
const serveStatic = require("serve-static");
const bodyParser = require("body-parser");
// const mongoose = require("mongoose");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const login_form = require("./server/login_form");

// mongoose.connect(process.env.MONGODB_URI);

require("./server/passport_config");

const session = require("express-session");

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(session({ secret: "secret777" }));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
    if ((req.path === "/" || req.path === "/index.html") && !req.isAuthenticated()) {
        return res.redirect("/login");
    }
    return next();
});

app.use(serveStatic(__dirname + "/dist"));

app.get("/login", (req, res) => {
    const message = req.flash("message")[0];
    res.send(login_form(message));
});

app.post("/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true
    })
);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Listening on port " + port));

