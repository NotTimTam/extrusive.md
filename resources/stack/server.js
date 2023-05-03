const express = require("express");
const app = express();
const port = 3000;

// Serve HTML pages
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

// Serve static files (e.g. CSS, JS, images)
app.use(express.static("public"));

// API endpoint that returns JSON data
app.get("/api/data", (req, res) => {
	const data = { name: "John Doe", age: 30, email: "johndoe@example.com" };
	res.json(data);
});

// Start the server
app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
