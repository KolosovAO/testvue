// const mongoose = require("mongoose");

// module.exports = mongoose.model("User", {
//     username: {
//         type: String,
//         unique: true,
//         required: true
//     },
//     password: {
//         type: String,
//         required: true
//     }
// });


module.exports = {
    _id: "TEMP_USER_ID",
    username: "medvebot",
    password: "medvebot",
    findOne({ username }, cb) {
        if (username !== this.username) {
            cb(null, null);
        }
        cb(null, this);
    },
    findById(id, cb) {
        if (id !== this._id) {
            cb(null, null);
        }
        cb(null, this);
    }
};