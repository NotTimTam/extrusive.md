/**
 * Trigger the page to scroll back to where it was.
 * @param {string} hash - The portion of the page to scroll to.
 * @param {string} location - The last location of the page before the route change.
 */
function triggerRescroll(hash, location) {
	try {
		if (hash && location === window.location.pathname) {
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
	const location = window.location.pathname;
	history.pushState(null, null, window.location.origin + path);

	// Update the page content.
	updatePageContent(data);

	// Create side nav.
	createInnerNavStructure(data);

	// If there was an inter-page link, route to it.
	triggerRescroll(hash, location);
}

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

		createPopup(err.response.data, "error");
		if (path !== "/content/README.html") {
			handleRequestFile("/content/README.html");
		}
	}
};

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
						.join("%20")
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
