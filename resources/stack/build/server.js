const app = require("express")();
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const appDir = __dirname + "/client";

// Middlewares.
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + "/client", { recursive: true }));

// Routers.
const markdownRoutes = require("./server/routes/markdownRoutes.js");

// Routes.
app.use("/api/v1/markdown", markdownRoutes);

// Serve HTML pages
// app.get("/", (req, res) => {
// 	res.status(200).sendFile(`${appDir}/index.html`);
// });

// Handling everything else.
app.get("*", (req, res) => {
	try {
		res.status(200).sendFile(`${appDir}/index.html`);
	} catch (err) {
		console.error(err);
		res.status(404).sendFile(`${appDir}/404.html`);
	}
});

// Start the server
app.listen(PORT, () => {
	console.log(`extrusive.md server listening on port ${PORT}`);
});
