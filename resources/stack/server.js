const app = require("express")();
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const appDir = __dirname + "/client";

//middlewares
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + "/client", { recursive: true }));

// Serve HTML pages
app.get("/", (req, res) => {
	res.status(200).sendFile(`${appDir}/index.html`);
});

// API endpoint that returns JSON data
app.get("/api/data", (req, res) => {
	const data = { name: "John Doe", age: 30, email: "johndoe@example.com" };
	res.json(data);
});

// Handling everything else.
app.get("*", (req, res) => {
	res.status(404).sendFile(`${appDir}/404.html`);
});

// Start the server
app.listen(PORT, () => {
	console.log(`extrusive.md server listening on port ${PORT}`);
});
