const express = require("express");
const serveStatic = require("serve-static");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

const MONGO_URL = "mongodb://serega_bandit:banditizm777@ds149481.mlab.com:49481/heroku_7jlvkgz6";
mongoose.connect(MONGO_URL);

require("./server/passport_config");

const session = require("express-session");

let app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(session({ secret: "secret777" }));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
    if ((req.path === "/" || req.path === "/index.html") && !req.isAuthenticated()) {
        res.redirect("/login");
    }
    return next();
});

app.use(serveStatic(__dirname + "/dist"));

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/server/login_form.html");
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

