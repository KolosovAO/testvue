const request = require("request");
const fs = require("fs");


request.get("https://api.opendota.com/api/heroStats", (err, res) => {
    const heroes = JSON.parse(res.body);
    for (const hero of heroes) {
        const imageURL = "http://cdn.dota2.com" + hero.icon;
        const name = hero.id + ".png";
        saveImage(imageURL, name);
    }
});
function saveImage(url, name) {
    request(url, {encoding: "binary"}, (error, res, body) => {
        fs.writeFile(__dirname + "/static/heroes/" + name, body, "binary", err => err ? console.log(err) : null);
    });
}