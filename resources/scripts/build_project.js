const fs = require("fs-extra");
const path = require("path");
const packageJson = require("../../package.json");

/**
 * Build an extrusive project.
 */
const build_project = (directory, { force }) => {
	try {
		const logInitializer = `extrusive.md v${packageJson.version}`;
		console.log(
			`\n${logInitializer}\n${"-".repeat(logInitializer.length)}\n`
		);

		// If the directory exists, we check whether it is empty or not.
		if (fs.existsSync(directory)) {
			const dir = fs.readdirSync(directory);

			if (dir && dir.length && !force)
				throw 'That directory already contains files. Include the "--force" keyword in your command to ignore this.';
		} else {
			fs.mkdirSync(directory); // Create the directory.
		}

		// Create the project directories.
		console.log("Creating necessary directories.");
		const directories = ["content", "public", "styles"];
		for (const dir of directories)
			if (!fs.existsSync(dir)) fs.mkdirSync(`${directory}/${dir}`);

		// Create the initial project files.
		console.log("Creating necessary files.");
		const files = [
			["resources/stack/README.md", "content/README.md"],
			["resources/stack/config.json", "extrusive.config.json"],
			["resources/stack/favicon.svg", "public/favicon.svg"],
			["resources/stack/gitignore.txt", ".gitignore"],
			[null, "styles/custom.css"],
		];
		for (const [src, dest] of files) {
			const srcPath = `${path.dirname(require.main.filename)}/${src}`; // Determine location to source data.
			const data = fs.existsSync(srcPath)
				? fs.readFileSync(srcPath, "utf-8")
				: ""; // Grab the source data.

			// Write the file.
			fs.writeFileSync(`${directory}/${dest}`, data, {
				force: true,
			});
		}

		console.log("\nAll set. Your adventure starts here! 🚀\n");
	} catch (err) {
		console.error("\nERROR:", err);
	}
};

module.exports = build_project;
