const path = require("path");
const packageJson = require("../../package.json");
const fs = require("fs-extra");
const { execSync } = require("child_process");

/**
 * Configure and copy the HTML file from the stack directory.
 * @param {string} stackDir - The stack directory to get the file from.
 */
const copyHTML = (stackDir, target, config) => {
	try {
		const { logo, title, author, description, favicon, styles, copyright } =
			config;

		// Load the html data.
		let HTMLData = fs.readFileSync(`${stackDir}/index.html`, "utf-8");

		// Configure title.
		HTMLData = HTMLData.replace(
			"{{TITLE}}",
			title || "my extrusive.md app"
		);

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

		// Configure copyright.
		HTMLData = HTMLData.replace(
			"{{COPYRIGHT}}",
			copyright ? copyright : ""
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
	} catch (err) {
		console.error("\nERROR:", err);
	}
};

/**
 * Build the client-side portion of the app.
 * @param {string} target - The target build directory.
 * @param {*} config - The user's configuration object.
 * @param {string} cwd - The current working directory.
 */
const build_client = (target, config, cwd) => {
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
		[`${cwd}/styles`, "styles", "directory"],
		[`${cwd}/public`, "public", "directory"],
		[`${stackDir}/style.css`, "style.css", "file"],
		[`${stackDir}/style.css.map`, "style.css.map", "file"],
		[`${stackDir}/client.js`, "client.js", "file"],
		[`${stackDir}/404.html`, "404.html", "file"],
	];
	for (const [src, dest, type] of files) {
		if (!fs.existsSync(src))
			throw `"${src.split("/")[1]}" ${type} does not exist.`;
		fs.copySync(src, `${target}/${dest}`);
	}

	// Configure and copy html.
	copyHTML(stackDir, `${target}/index.html`, config);
};

/**
 * Build the server-side portion of the app.
 * @param {string} target - The target build directory.
 * @param {*} config - The user's configuration object.
 * @param {string} cwd - The current working directory.
 */
const build_server = (target, config, cwd) => {
	// Copy the build structure.
	console.log("Copying server.");
	const stackDir = `${path.dirname(require.main.filename)}/resources/stack`;
	const structure = [
		[`${stackDir}/server.js`, "server.js", "file"],
		[`${stackDir}/server`, "server", "directory"],
		[`${cwd}/content`, "server/content", "directory"],
		[`${stackDir}/gitignore.txt`, ".gitignore", "file"],
		[`${stackDir}/env.txt`, ".env", "file"],
	];
	for (const [src, dest, type] of structure) {
		if (!fs.existsSync(src))
			throw `"${src.split("/")[1]}" ${type} does not exist.`;
		fs.copySync(src, `${target}/${dest}`);
	}

	console.log("Finished copying server.");
};

/**
 * Build an extrusive app.
 */
const build_app = ({ outputDirectory, force }, commands) => {
	try {
		const logInitializer = `extrusive.md v${packageJson.version}`;
		console.log(
			`\n${logInitializer}\n${"-".repeat(logInitializer.length)}\n`
		);

		// Handle a user provided output directory.
		let target;
		if (outputDirectory) {
			if (fs.existsSync(outputDirectory)) {
				if (force) {
					fs.emptyDirSync(outputDirectory);
					target = outputDirectory;
				} else
					throw 'The provided output directory contains files. Use the "--force" option to overwrite its contents.';
			} else {
				fs.mkdirSync(outputDirectory, { recursive: true });
				target = outputDirectory;
			}
		}

		// Get the current working directory.
		const cwd = process.cwd();
		target = target || `${cwd}\\build`;
		console.log(`Building from "${cwd}".`);

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

		build_server(target, config, cwd); // Build the server-side.
		build_client(target, config, cwd); // Build the client-side.

		// Install necessary packages.
		console.log("Installing necessary packages...");
		process.chdir(target);
		execSync("npm install express dotenv cors directory-tree fs-extra");

		console.log(
			"\nBuild complete. Your markdown is now ready to shine! ✨\n"
		);
	} catch (err) {
		console.error("\nERROR:", err);
	}
};

module.exports = build_app;
