/**
 * Normalize a route path.
 * @param {string} path - The path to normalize.
 * @returns A normalized path.
 */
const normalizePath = (path) =>
	path.includes("content") ? `content${path.split("content")[1]}` : "/";

/**
 * Request a file by path.
 * @param {string} path - The path to the file that is being requested.
 */
const handleRequestFile = async (path) => {
	// Trigger loading element.
	triggerLoadingArticleContent();

	try {
		const data = content[normalizePath(path)];

		renderArticle(data, normalizePath(path));
		indicateSelectedNav(normalizePath(path));
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
	const normalizedPath = normalizePath(window.location.pathname);
	if (normalizedPath === "/") handleRequestFile("/content/README.html");
	else handleRequestFile(normalizedPath);
};
