const express = require("express");
const serveStatic = require("serve-static");
const bodyParser = require("body-parser");

let current_hash = "31415";

let app = express();
app.use(bodyParser.json());
app.use(express.urlencoded());
app.use((req, res, next) => {
	if (req.originalUrl === "/" || req.originalUrl === "/index.html") {
		res.send("invalid hash");
	}
	if (req.originalUrl.includes("?hash")) {
		if (req.originalUrl === "/?hash=" + current_hash) {
			next();
		} else {
			res.send("invalid hash");
		}
		return;
	}
	next();
});

app.use(serveStatic(__dirname + "/dist"));

app.post("/update", (req, res) => {
	current_hash = req.body.hash;
	res.status(200);
	res.send("new url - http://dota-pick-tester.herokuapp.com/?hash=" + req.body.hash);
});

app.get("/generate_hash", (req, res) => {
	res.send(`
		<!DOCTYPE html>
		<html>
		<body>
			<form method="post" action="update">
				<input type="text" name="hash" value="${current_hash}"/>
				<button>update hash</button>
			</form>
		</body>
		</html>
	`);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log("Listening on port " + port)
});

