var tesseract = require('node-tesseract'),
	express = require("express"),
	app = express();
const url = "public/images/example.jpeg";

// App config
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// Render homepage
app.get("/", function(req, res) {
	tesseract.process(url, (err, text) => {
        if(err){
            return console.log("An error occured: ", err);
        }
        console.log("Recognized text:");
        console.log(text);
    });
	res.render("index");
});

// Server config
app.listen(3000, function() {
	console.log("Server started");
});