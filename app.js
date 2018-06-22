var tesseract = require('node-tesseract'),
    request = require('request'),
    express = require('express'),
    fs = require('fs');
	app = express();
const url = "https://upload.wikimedia.org/wikipedia/commons/7/75/Southern_Life_in_Southern_Literature_text_page_322.jpg";
const fileName = "text.png";

var writeFileStream = fs.createWriteStream(fileName);

// App config
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// Render homepage
app.get("/", function(req, res) {
    request(url).pipe(writeFileStream).on('close', function() {
        console.log(url, 'saved to', fileName);
        tesseract.process(fileName, (err, text) => {
            if (err) {
                console.log("An error occured: ", err);
                return;
            }
            console.log("Recognized text:");
            console.log(text);
        });
    })
	res.render("index");
});

// Server config
app.listen(3000, function() {
	console.log("Server started");
});