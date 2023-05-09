/**
 * Gets the current location.search and grabs the document field.
 * @returns {string} A path to the requested document.
 */
function getDocumentQuery() {
	return window.location.search.split("document=")[1].replace(/%20/g, " ");
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
	window.location.search = `?document=${path}`;
	const location = window.location.pathname;
	// history.pushState(null, null, window.location.origin + `?document=${path}`);

	// Update the page content.
	updatePageContent(data);

	// Create side nav.
	createInnerNavStructure(data);

	// If there was an inter-page link, route to it.
	triggerRescroll(hash, location);
}

/**
 * Normalize a route path.
 * @param {string} path - The path to normalize.
 * @returns A normalized path.
 */
const normalizePath = (path) =>
	path.includes("content") ? `/content${path.split("content")[1]}` : "/";

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

		updatePageContent(
			`<p class="error"><ion-icon name="warning-outline"></ion-icon> Could not load that file.</p>`
		);
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
