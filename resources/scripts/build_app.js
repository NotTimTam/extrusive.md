const path = require("path");
const packageJson = require("../../package.json");
const fs = require("fs-extra");

/**
 * Configure and copy the HTML file from the stack directory.
 * @param {string} stackDir - The stack directory to get the file from.
 */
const copyHTML = (stackDir, target, config) => {
	const { title, author, description, favicon, styles } = config;

	// Load the html data.
	let HTMLData = fs.readFileSync(`${stackDir}/index.html`, "utf-8");

	// Configure title.
	HTMLData = HTMLData.replace("{{TITLE}}", title || "my extrusive.md app");

	// Configure metadata.
	HTMLData = HTMLData.replace(
		"{{META}}",
		`
	<meta name="author" content="${author || "Anonymous"}">
    <meta name="description" content="${
		description ||
		"Website built with extrusive.md! https://github.com/NotTimTam/extrusive.md"
	}">
	<link rel="shortcut icon" href="${favicon}" type="image/x-icon">
	`
	);

	// Configure custom user styles.
	if (styles) {
		HTMLData = HTMLData.replace(
			"{{STYLE}}",
			`
			${styles.map((src) => `<link rel="stylesheet" href="${src}" />`)}
		`
		);
	}

	// Write the HTML file.
	fs.writeFileSync(target, HTMLData);
};

/**
 * Build an extrusive app.
 */
const build_app = ({ dev }, commands, target) => {
	try {
		const logInitializer = `extrusive.md v${packageJson.version}`;
		console.log(
			`\n${logInitializer}\n${"-".repeat(logInitializer.length)}\n`
		);

		// Get the current working directory.
		const cwd = process.cwd();
		target = target || `${cwd}\\build`;
		console.log(
			`Building in ${
				dev ? "developer" : "production"
			} mode from "${cwd}".`
		);

		// Load configuration from user.
		console.log("Loading user configuration.");
		const configSrc = `${cwd}/extrusive.config.json`;
		if (!fs.existsSync(configSrc))
			throw 'An "extrusive.config.js" file does not exist in the root of your project directory.';
		const config = JSON.parse(fs.readFileSync(configSrc, "utf-8"));

		// If a build folder exists, clear it.
		if (fs.existsSync(target)) {
			console.log("Build folder exists.");
		} else {
			// Create the build folder if it doesn't exist.
			fs.mkdirSync(target);
		}

		// Create the build directories.
		console.log("Copying necessary directories.");
		const directories = ["content", "public"];
		for (const dir of directories)
			if (!fs.existsSync(dir)) fs.mkdirSync(`${directory}/${dir}`);

		// Copy the build files.
		console.log("Copying necessary files.");
		const stackDir = `${path.dirname(
			require.main.filename
		)}/resources/stack`;
		const files = [
			[`${cwd}/styles`, "styles"],
			[`${cwd}/public`, "public"],
			[`${cwd}/content`, "content"],
			[`${stackDir}/style.css`, "style.css"],
		];
		for (const [src, dest] of files) {
			fs.copySync(src, `${target}/${dest}`);
		}

		// Configure and copy html.
		copyHTML(stackDir, `${target}/index.html`, config);

		console.log(
			"\nBuild complete. Your markdown is now ready to shine! ✨\n"
		);
	} catch (err) {
		console.error("\nERROR:", err);
	}
};

module.exports = build_app;
