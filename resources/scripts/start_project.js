const nodemon = require("nodemon");
const { exec } = require("child_process");

/**
 * Start a development server.
 * @param {string} dir - The directory to look at for the server.
 */
const start_project = (dir) => {
	try {
		nodemon({
			watch: dir,
			ext: "html css js",
			delay: 1000, // milliseconds
		}).on("change", () => {
			console.log("Files in build directory changed, reloading...");
			exec("http-server build -o");
		});
	} catch (err) {
		console.error("\nERROR:", err);
	}
};

module.exports = start_project;
