const path = require("path");
const packageJson = require("../../package.json");
const fs = require("fs-extra");

/**
 * Configure and copy the HTML file from the stack directory.
 * @param {string} stackDir - The stack directory to get the file from.
 */
const copyHTML = (stackDir, target, config) => {
	const { logo, title, author, description, favicon, styles } = config;

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

	// Configure logo.
	HTMLData = HTMLData.replace(
		"{{LOGO}}",
		logo ? logo.data : `<h1 class="no-title">my extrusive app</h1>`
	);

	// Configure custom user styles.
	HTMLData = HTMLData.replace(
		"{{STYLE}}",
		`
			${styles ? styles.map((src) => `<link rel="stylesheet" href="${src}" />`) : ""}
		`
	);

	// Write the HTML file.
	fs.writeFileSync(target, HTMLData);
};

/**
 * Build the client-side portion of the app.
 * @param {boolean} dev - Whether to build in dev mode or not.
 * @param {string} target - The target build directory.
 * @param {*} config - The user's configuration object.
 * @param {string} cwd - The current working directory.
 */
const build_client = (dev, target, config, cwd) => {
	// Add sub-directory to target.
	target = target + "/client";

	// Create the build directories.
	console.log("Copying necessary client directories.");
	const directories = ["content", "public"];
	for (const dir of directories)
		if (!fs.existsSync(dir)) fs.mkdirSync(`${target}/${dir}`);

	// Copy the build files.
	console.log("Copying necessary client files.");
	const stackDir = `${path.dirname(require.main.filename)}/resources/stack`;
	const files = [
		[`${cwd}/styles`, "styles"],
		[`${cwd}/public`, "public"],
		[`${cwd}/content`, "content"],
		[`${stackDir}/style.css`, "style.css"],
		[`${stackDir}/style.css.map`, "style.css.map"],
		[`${stackDir}/script.js`, "script.js"],
	];
	for (const [src, dest] of files) {
		fs.copySync(src, `${target}/${dest}`);
	}

	// Configure and copy html.
	copyHTML(stackDir, `${target}/index.html`, config);
};

/**
 * Build the server-side portion of the app.
 * @param {boolean} dev - Whether to build in dev mode or not.
 * @param {string} target - The target build directory.
 * @param {*} config - The user's configuration object.
 * @param {string} cwd - The current working directory.
 */
const build_server = (dev, target, config, cwd) => {
	// Copy the build structure.
	console.log("Copying server.");
	const stackDir = `${path.dirname(require.main.filename)}/resources/stack`;
	const structure = [
		[`${stackDir}/server.js`, "server.js"],
		[`${stackDir}/server`, "server"],
	];
	for (const [src, dest] of structure) {
		fs.copySync(src, `${target}/${dest}`);
	}

	console.log("Finished copying server.");
};

/**
 * Build an extrusive app.
 * @param {string} target - The target directory to build to.
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
		const config = JSON.parse(fs.readFileSync(configSrc, "utf-8") || "{}");

		// If a build folder exists, clear it.
		if (fs.existsSync(target)) {
			fs.emptydirSync(target);
		} else {
			// Create the build folder if it doesn't exist.
			fs.mkdirSync(target, { recursive: true });
		}

		build_server(dev, target, config, cwd); // Build the server-side.
		build_client(dev, target, config, cwd); // Build the client-side.

		console.log(
			"\nBuild complete. Your markdown is now ready to shine! ✨\n"
		);
	} catch (err) {
		console.error("\nERROR:", err);
	}
};

module.exports = build_app;
