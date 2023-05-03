const path = require("path");
const packageJson = require("../../package.json");
const fs = require("fs-extra");
const { execSync } = require("child_process");
const dirTree = require("directory-tree");
const { marked } = require("marked");

const convert_to_html = (path) => {
	const files = fs.readdirSync(path);

	files.forEach((file) => {
		const filePath = `${path}/${file}`;
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			convert_to_html(filePath);
		} else {
			const existingData = fs.readFileSync(filePath, "utf-8");

			const convertedData = marked.parse(existingData);
			const newPath = filePath.replace(new RegExp(".md", "g"), ".html");

			// Rename the file.
			fs.renameSync(filePath, newPath);

			// Write the parsed contents.
			fs.writeFileSync(newPath, convertedData);
		}
	});
};

/**
 * Configure and copy the HTML file from the stack directory.
 * @param {string} stackDir - The stack directory to get the file from.
 */
const copy_html = (stackDir, target, config, imports) => {
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
	<link rel="shortcut icon" href="/${favicon}" type="image/x-icon">
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
			${styles ? styles.map((src) => `<link rel="stylesheet" href="/${src}" />`) : ""}
		`
		);

		// Configure additional imports.
		HTMLData = HTMLData.replace(
			"{{SCRIPT}}",
			imports
				? imports
						.map(({ path, type }) => {
							if (type === "script")
								return `<script src="/${path}"></script>`;
						})
						.join("\n")
				: ""
		);

		// Write the HTML file.
		fs.writeFileSync(target, HTMLData);
	} catch (err) {
		console.error("\nERROR:", err);
	}
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

	// Convert all markdown to pre-rendered html.
	convert_to_html(`${target}/server/content`);

	console.log("Finished copying server.");
};

/**
 * Build the client-side portion of the app.
 * @param {string} target - The target build directory.
 * @param {*} config - The user's configuration object.
 * @param {string} cwd - The current working directory.
 */
const build_client = (target, config, cwd) => {
	// Add sub-directory to target.
	const contentTarget = `${target}/server/content`;
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

	// Build app indeces.
	console.log("Building file structure caches.");
	const caches = [
		[
			// The file tree is localized to not include the servers entire file structure in the path.
			`const fileTree = ${JSON.stringify(
				dirTree(contentTarget, { normalizePath: true })
			)
				.replace(new RegExp(cwd.split("\\").join("/"), "g"), "")
				.replace(new RegExp("/build/server", "g"), "")}`,
			"file-tree.js",
		],
	];
	for (const [data, dest] of caches) {
		fs.outputFileSync(`${target}/${dest}`, data);
	}

	// Configure and copy html.
	copy_html(stackDir, `${target}/index.html`, config, [
		{ path: "file-tree.js", type: "script" },
	]);
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
		execSync("npm install express dotenv cors fs-extra");

		console.log(
			"\nBuild complete. Your markdown is now ready to shine! ✨\n"
		);
	} catch (err) {
		console.error("\nERROR:", err);
		process.exit(1);
	}
};

module.exports = build_app;
