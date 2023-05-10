/**
 * Trigger the page to scroll back to where it was.
 * @param {string} hash - The portion of the page to scroll to.
 * @param {string} location - The last location of the page before the route change.
 */
function triggerRescroll(hash, search) {
	try {
		if (hash && search === window.location.search) {
			setTimeout(() => {
				window.location.hash = hash;

				const hashSrc = document.querySelector(hash);
				if (hashSrc) handleScroll(hash);
			}, 250);
		}
	} catch (err) {
		console.error("Failed rescroll.", err);
	}
}

/**
 * Gets the current location.search and grabs the document field.
 * @returns {string} A path to the requested document.
 */
function getDocumentQuery() {
	return (
		window.location.search &&
		window.location.search.split("document=")[1].replace(/%20/g, " ")
	);
}

/**
 * Render a new article.
 * @param {string} data - The article content.
 * @param {string} path - The original path to the content on the server.
 */
function renderArticle(data, path) {
	const title = path.split("/")[path.split("/").length - 1].split(".")[0];

	// Update the document title.
	document.title = title;

	// Update the url.
	const hash = window.location.hash;
	const search = window.location.search;
	history.pushState(null, null, `?document=${path}`);

	// Update the page content.
	updatePageContent(data);

	// Create side nav.
	createInnerNavStructure(data);

	// If there was an inter-page link, route to it.
	triggerRescroll(hash, search);
}

/**
 * Normalize a route path.
 * @param {string} path - The path to normalize.
 * @returns A normalized path.
 */
const normalizePath = (path) =>
	(path.includes("content")
		? `/content${path.split("content")[1]}`
		: "/"
	).replace(/%20/g, " ");

/**
 * indicate which nav elements are active.
 * @param {string} path - The path to the file that is being requested.
 */
function indicateSelectedNav(path) {
	try {
		const folders = document.querySelectorAll("aside.nav h1");
		const navElements = [
			...document.querySelectorAll("aside.nav button"),
			...folders,
		];

		for (const elem of navElements) {
			elem.classList.remove("active");
		}

		for (const folder of folders)
			if (
				path.includes(
					folder.id
						.split("_")
						.join("/")
						.replace("folder-", "")
						.split("S20S")
						.join(" ")
				)
			) {
				folder.classList.add("active");
				folder.parentElement.classList.add("open");
			}

		const activeButton = document.querySelector(
			`aside.nav button.file#file-${
				path
					.split("/")
					.join("_")
					.split("%20")
					.join("S20S")
					.split(" ")
					.join("S20S")
					.split(".")[0]
			}`
		);

		if (activeButton) {
			activeButton.classList.add("active");
		}
	} catch (err) {
		console.error(err);
	}
}

/**
 * Request a file by path.
 * @param {string} path - The path to the file that is being requested.
 */
const handleRequestFile = async (path) => {
	// Trigger loading element.
	triggerLoadingArticleContent();

	try {
		const normalizedPath = normalizePath(path);
		const data = content[normalizedPath]
			.replace(/&#39;/g, "'")
			.replace(/&quot;/g, '"')
			.replace(/&gt;/g, ">")
			.replace(/&lt;/g, "<")
			.replace(/&amp;/g, "&");

		renderArticle(data, normalizedPath);
		indicateSelectedNav(normalizedPath);
	} catch (err) {
		console.error(err);

		createPopup("Could not load that document.", "error");
		if (path !== "/content/README.html") {
			handleRequestFile("/content/README.html");
		}
	}
};

/**
 * Search files for info.
 * @param {Event} e - The input element's event for oninput.
 */
const handleSearchFiles = async (e) => {
	try {
		const { value: query } = e.target;

		const data = searchIndices
			.filter(
				({ path, data }) =>
					path.toLowerCase().includes(query.toLowerCase()) ||
					data.includes(query.toLowerCase())
			)
			.map(({ path }) => path);

		displaySearchResults(data);
	} catch (err) {
		console.error(err);
	}
};

window.onload = () => {
	const query = getDocumentQuery();

	if (query) return handleRequestFile(query);

	const normalizedPath = normalizePath(window.location.pathname);
	if (normalizedPath === "/") handleRequestFile("/content/README.html");
};
