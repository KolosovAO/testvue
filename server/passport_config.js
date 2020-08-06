const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");
const bCrypt = require("bcrypt-nodejs");

const isValidPassword = (user, password) => {
    return bCrypt.compareSync(password, user.password);
}

const createHash = (password) => {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

passport.use(new LocalStrategy(
    { passReqToCallback: true },
    (req, username, password, done) => {
        User.findOne({ username: username }, (err, user) => {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: "Incorrect username." });
            }
            if (!isValidPassword(user, password)) {
                return done(null, false, { message: "Incorrect password." });
            }
            return done(null, user);
        });
    }
));

passport.use("signup", new LocalStrategy(
    { passReqToCallback: true },
    (req, username, password, done) => {
        process.nextTick(() => {
            User.findOne({ username }, (err, user) => {
                if (err) {
                    return done(err);
                }
                if (user) {
                    return done(null, false, req.flash('message', 'User Already Exists'));
                } else {
                    const newUser = new User();

                    newUser.username = username;
                    newUser.password = createHash(password);

                    newUser.save(function (err) {
                        if (err) {
                            throw err;
                        }
                        return done(null, newUser);
                    });
                }
            });
        });
    })
);


passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});
