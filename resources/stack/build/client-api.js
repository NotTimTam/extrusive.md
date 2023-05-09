/**
 * Request a file by path.
 * @param {string} path - The path to the file that is being requested.
 */
const handleRequestFile = async (path) => {
	// Trigger loading element.
	triggerLoadingArticleContent();

	try {
		const { data } = await axios.get("/api/v1/markdown", {
			params: { path },
		});

		renderArticle(data, path);
		indicateSelectedNav(path);
	} catch (err) {
		console.error(err);

		updatePageContent(
			`<p class="error"><ion-icon name="warning-outline"></ion-icon> ${err.response.data}</p>`
		);
	}
};

let cancelSearch;
/**
 * Search files for info.
 * @param {Event} e - The input element's event for oninput.
 */
const handleSearchFiles = async (e) => {
	try {
		const { value: query } = e.target;

		cancelSearch && cancelSearch();
		const { data } = await axios.get(`/api/v1/markdown/search`, {
			params: { query },
			cancelToken: new axios.CancelToken((canceler) => {
				cancelSearch = canceler;
			}),
		});

		displaySearchResults(data);
	} catch (err) {
		console.error(err);
	}
};

window.onload = () => {
	if (window.location.pathname === "/")
		handleRequestFile("/content/README.html");
	else handleRequestFile(window.location.pathname);
};
