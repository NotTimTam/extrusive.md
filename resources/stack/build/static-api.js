/**
 * Request a file by path.
 * @param {string} path - The path to the file that is being requested.
 */
const handleRequestFile = async (path) => {
	// Trigger loading element.
	triggerLoadingArticleContent();

	try {
		const { data } = content[path];

		renderArticle(data, path);
		indicateSelectedNav(path);
	} catch (err) {
		console.error(err);

		updatePageContent(
			`<p class="error"><ion-icon name="warning-outline"></ion-icon> ${err.response.data}</p>`
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
