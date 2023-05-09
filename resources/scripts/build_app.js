const path = require("path");
const packageJson = require("../../package.json");
const fs = require("fs-extra");
const dirTree = require("directory-tree");
const { marked } = require("marked");
const { gfmHeadingId } = require("marked-gfm-heading-id");
const { normalize_path, replace_all, copy_paths } = require("./util");

marked.use(
	{
		langPrefix: "",
		mangle: false,
		headerIds: false,
	},
	gfmHeadingId()
);

/**
 * Recursively convert all markdown files to html and build search indices.
 * @param {*} path -  The path to the file.
 * @param {string} cwd - The current working directory.
 * @returns Newly generated search indices.
 */
const compile_file_tree = (path, cwd) => {
	const files = fs.readdirSync(path);

	let search_indices = [];

	files.forEach((file) => {
		const filePath = `${path}/${file}`;
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			const additionalIndices = compile_file_tree(filePath, cwd);

			search_indices = [...search_indices, ...additionalIndices];
		} else {
			const existingData = fs.readFileSync(filePath, "utf-8");

			const convertedData = marked.parse(existingData);
			const newPath = replace_all(filePath, ".md", ".html"); // Replace any .md file extensions with .html.

			// Rename the file.
			fs.renameSync(filePath, newPath);

			// Write the parsed contents.
			fs.writeFileSync(newPath, convertedData);

			console.log(`Creating search directory for "${newPath}"`);

			// Store page indeces.
			search_indices = [
				...search_indices,
				{
					// Replace all instances of the cwd or "/build/server" from the newly normalized path.
					path: replace_all(
						replace_all(normalize_path(newPath), cwd, ""),
						"/build/server",
						""
					),
					data: Array.from(new Set(existingData.split(" ")))
						.join(" ")
						.toLowerCase(),
				},
			];
		}
	});

	return search_indices;
};

/**
 * Configure and copy the HTML file from the stack directory.
 * @param {string} stackDir - The stack directory to get the file from.
 */
const copy_html = async (stackDir, target, config, imports) => {
	try {
		const { logo, title, author, description, favicon, styles, copyright } =
			config;

		/**
		 * Everything that needs to be populated in the HTML file.
		 */
		const replacements = [
			// Title
			["{{TITLE}}", title || "my extrusive.md app"],
			// Metadata
			[
				"{{META}}",
				`
<meta name="author" content="${author || "Anonymous"}">
<meta name="description" content="${
					description ||
					"Website built with extrusive.md! https://github.com/NotTimTam/extrusive.md"
				}">
<link rel="shortcut icon" href="/${favicon}" type="image/x-icon">
`,
			],
			// Logo
			[
				"{{LOGO}}",
				logo ? logo.data : `<h1 class="no-title">my extrusive app</h1>`,
			],
			// Copyright
			["{{COPYRIGHT}}", copyright ? copyright : ""],
			// Custom CSS Files
			[
				"{{STYLE}}",
				`
			${styles ? styles.map((src) => `<link rel="stylesheet" href="/${src}" />`) : ""}
		`,
			],
			// Scripts
			[
				"{{SCRIPT}}",
				imports
					? imports
							.map(({ path, type }) => {
								if (type === "script")
									return `<script src="/${path}"></script>`;
							})
							.join("\n")
					: "",
			],
		];

		// Load the html data.
		let HTMLData = await fs.readFile(`${stackDir}/index.html`, "utf-8");

		// Configure replacements.
		for (const [target, data] of replacements)
			HTMLData = HTMLData.replace(target, data);

		// Write the HTML file.
		await fs.writeFile(target, HTMLData);
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
const build_server = async (target, config, cwd) => {
	// Copy the build structure.
	console.log("Copying server.");
	const stackDir = `${path.dirname(require.main.filename)}/resources/stack`;
	await copy_paths([
		[`${stackDir}/server.js`, `${target}/server.js`, "file"],
		[`${stackDir}/server`, `${target}/server`, "directory"],
		[`${cwd}/content`, `${target}/server/content`, "directory"],
		[`${stackDir}/gitignore.txt`, `${target}/.gitignore`, "file"],
		[`${stackDir}/env.txt`, `${target}/.env`, "file"],
	]);

	// Convert all markdown to pre-rendered html and get search indices.
	const search_indices = compile_file_tree(`${target}/server/content`, cwd);

	// Save search indices.
	await fs.outputFile(
		`${target}/server/util/searchIndices.js`,
		`const searchIndices=${JSON.stringify(
			search_indices
		)}; module.exports = searchIndices;`,
		{ recursive: true }
	);

	// Save package.json.
	if (await fs.exists(`${stackDir}/package.json.txt`)) {
		console.log("Generating package.json.");
		const { title, author, description, copyright } = config;

		const newPackage = {
			...JSON.parse(
				await fs.readFile(`${stackDir}/package.json.txt`, "utf-8")
			),
			name: title ? title : "",
			author: author ? author : "",
			description: description ? description : "",
			license: copyright ? copyright : "ISC",
		};

		await fs.outputFile(
			`${target}/package.json`,
			JSON.stringify(newPackage)
		);
	}

	console.log("Finished copying server.");
};

/**
 * Build the client-side portion of the app.
 * @param {string} target - The target build directory.
 * @param {*} config - The user's configuration object.
 * @param {string} cwd - The current working directory.
 */
const build_client = async (target, config, cwd) => {
	// Add sub-directory to target.
	const contentTarget = `${target}/server/content`;
	target = target + "/client";

	// Create the build directories.
	console.log("Copying necessary client directories.");
	const directories = ["content", "public"];
	for (const dir of directories)
		if (!(await fs.exists(dir))) await fs.mkdir(`${target}/${dir}`);

	// Copy the build files.
	console.log("Copying necessary client files.");
	const stackDir = `${path.dirname(require.main.filename)}/resources/stack`;
	await copy_paths([
		[`${cwd}/styles`, `${target}/styles`, "directory"],
		[`${cwd}/public`, `${target}/public`, "directory"],
		[`${stackDir}/style.css`, `${target}/style.css`, "file"],
		[`${stackDir}/style.css.map`, `${target}/style.css.map`, "file"],
		[`${stackDir}/client.js`, `${target}/client.js`, "file"],
		[`${stackDir}/404.html`, `${target}/404.html`, "file"],
	]);

	// Build app indeces.
	console.log("Building file structure caches.");
	const caches = [
		[
			// The file tree is localized to not include the servers entire file structure in the path.
			`const fileTree = ${replace_all(
				replace_all(
					JSON.stringify(
						dirTree(contentTarget, { normalizePath: true })
					),
					cwd,
					""
				),
				"/build/server",
				""
			)}`,
			"file-tree.js",
		],
	];
	for (const [data, dest] of caches) {
		await fs.outputFile(`${target}/${dest}`, data);
	}

	// Configure and copy html.
	await copy_html(stackDir, `${target}/index.html`, config, [
		{ path: "file-tree.js", type: "script" },
	]);
};

/**
 * Build an extrusive app.
 */
const build_app = async ({ outputDirectory, force }, commands) => {
	try {
		const logInitializer = `extrusive.md v${packageJson.version}`;
		console.log(
			`\n${logInitializer}\n${"-".repeat(logInitializer.length)}\n`
		);

		// Handle a user provided output directory.
		let target;
		if (outputDirectory) {
			if (await fs.exists(outputDirectory)) {
				if (force) {
					await fs.emptyDir(outputDirectory);
					target = normalize_path(outputDirectory); // Ensure the path string to the target is normalized.
				} else
					throw 'The provided output directory contains files. Use the "--force" option to overwrite its contents.';
			} else {
				await fs.mkdir(outputDirectory, { recursive: true });
				target = normalize_path(outputDirectory); // Ensure the path string to the target is normalized.
			}
		}

		// Get the current working directory.
		const cwd = normalize_path(process.cwd());
		target = target || `${cwd}/build`;
		console.log(`Building from "${cwd}".`);

		// Load configuration from user.
		console.log("Loading user configuration.");
		const configSrc = `${cwd}/extrusive.config.json`;
		if (!(await fs.exists(configSrc)))
			throw 'An "extrusive.config.js" file does not exist in the root of your project directory.';
		const config = JSON.parse(
			(await fs.readFile(configSrc, "utf-8")) || "{}"
		);

		// If a build folder exists, clear it.
		if (await fs.exists(target)) {
			await fs.emptydir(target);
		} else {
			// Create the build folder if it doesn't exist.
			await fs.mkdir(target, { recursive: true });
		}

		await build_server(target, config, cwd); // Build the server-side.
		await build_client(target, config, cwd); // Build the client-side.

		console.log(
			"\nBuild complete. Your markdown is now ready to shine! ✨\n"
		);
	} catch (err) {
		console.error("\nERROR:", err);
		process.exit(1);
	}
};

module.exports = build_app;
