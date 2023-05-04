// Functions

/**
 * Get the current color theme setting.
 * @returns {string} the current color theme.
 */
function getColorTheme() {
	try {
		let themeCookie = localStorage.getItem("theme");

		if (!themeCookie) {
			themeCookie = localStorage.setItem(
				"theme",
				window.matchMedia("(prefers-color-scheme: dark)").matches
					? "dark"
					: "light"
			);
		}

		updateColorThemeSettings(themeCookie); // Update the styling to match the theme.

		return themeCookie;
	} catch (err) {
		console.error(err);
	}
}

/**
 * Set the color theme.
 * @param {string} theme - The new theme value to set.
 */
function setColorTheme(theme) {
	const themeCookie = theme
		? theme
		: window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
	localStorage.setItem("theme", themeCookie);

	updateColorThemeSettings(themeCookie); // Update the styling to match the theme.
}

/**
 * Update the styling of the app to match the current theme.
 * @param {string} themeCookie the color theme to set.
 */
function updateColorThemeSettings(themeCookie) {
	document.body.className = themeCookie;
}

/**
 * Update color theme button to match the current theme.
 */
function updateColorThemeButton() {
	const button = document.querySelector("button#theme");
	const currentTheme = getColorTheme();

	button.innerHTML =
		currentTheme === "dark"
			? `<ion-icon name="sunny-outline" size="large"></ion-icon>`
			: `<ion-icon name="moon-outline" size="large"></ion-icon>`;
}

/**
 * Update the navbar drawer button (on mobile) to match the current navbar state.
 */
function updateNavButton() {
	const navOpen =
		document.querySelector("aside.nav").getAttribute("open") === "true";
	const button = document.querySelector("button#nav");

	button.setAttribute("open", navOpen.toString());

	button.innerHTML = navOpen
		? `<ion-icon name="close-outline" size="large"></ion-icon>`
		: `<ion-icon name="menu-outline" size="large"></ion-icon>`;
}

/**
 * Create a button linking to a file.
 * @param {string} name - The name of the file.
 * @param {string} path - The path to the file the button is linking.
 * @param {number} nestLevel - The number of folders deep this file is.
 * @returns
 */
function createFileButton(name, path, nestLevel) {
	return `
<button class="file" onclick="handleCloseNav(); handleRequestFile('${path}');" style="padding-left: ${
		nestLevel * 16
	}px;" id="${
		path.split("/").join("_").split(" ").join("space").split(".")[0]
	}">
	<ion-icon name="document-outline"></ion-icon>
	${name.split(".")[0]}
</button>
`;
}

/**
 * Toggle the dropdown of a folder menu.
 * @param {string} folder - The identifier of the folder to toggle.
 */
function toggleNavDropdown(folder) {
	try {
		document.querySelector(`section#${folder}`).classList.toggle("open");
	} catch (err) {
		console.error(err);
	}
}

/**
 * Get the folder tree.
 */
function getFolderTree() {
	try {
		createFolderStructureDisplay(fileTree);
	} catch (err) {
		console.error(err);
	}
}

/**
 * Recursively build an html structure for the nav.
 * @param {*} data - The data returned from the server.
 */
function recurseDisplayFolderTree(data, html = "", nestLevel = 0) {
	const { children, name, path } = data;

	if (children) {
		// Handle folders.

		return `${html} 
			<section depth="${nestLevel}" class="folder" id="${name}-${nestLevel}">
			${
				nestLevel === 0
					? ""
					: `<h1 id="${
							path.split("/").join("_").split(".")[0]
					  }" style="padding-left: ${
							16 * nestLevel
					  }px" onclick="toggleNavDropdown('${name}-${nestLevel}')">
					<div class="title">
						<ion-icon name="folder-outline"></ion-icon>
						${name}
					</div>

					<ion-icon id="arrow" name="chevron-down-outline"></ion-icon>
				</h1>`
			}

			${children
				.map((child) =>
					recurseDisplayFolderTree(child, html, nestLevel + 1)
				)
				.join(" ")}
				</section>
			`;
	} else {
		// Don't include the root README.md.
		if (nestLevel === 1 && name === "README.html") return html;

		// Handle files.
		return html + createFileButton(name, path, nestLevel);
	}
}

/**
 * Create the folder structure display recursively.
 * @param {*} data - The folder structure data compiled with the app.
 */
function createFolderStructureDisplay(data) {
	const nav = document.querySelector("aside.nav");

	const htmlData = recurseDisplayFolderTree(data);
	nav.innerHTML = htmlData;
}

/**
 * Scroll to an element properly.
 * @param {string} query - The HTML query selector of the element to scroll to.
 */
function handleScroll(query) {
	try {
		const targetElement = document.querySelector(query);

		window.location.hash = `#${targetElement.id}`;

		const articleInner = document
			.querySelector("div.article-inner")
			.getBoundingClientRect().y;

		const offset = targetElement.getBoundingClientRect().y - articleInner;

		document.body.scrollTo({
			top: offset,
			behavior: "smooth",
		});
	} catch (err) {
		console.error(err);
	}
}

/**
 * Determine which subfolder should be highlighted.
 */
async function determineInnerNavPos() {
	if (window.innerWidth < 1535) return;

	try {
		const header = document
			.querySelector("header.page-header")
			.getBoundingClientRect().height;
		const navButtons = document.querySelectorAll(
			"aside.inner-nav h1, aside.inner-nav h2, aside.inner-nav h3, aside.inner-nav h4, aside.inner-nav h5, aside.inner-nav h6"
		);

		let scrolledElem = null;
		for (const button of navButtons) {
			const targetElement = document.querySelector(
				`${button.tagName}#${button.getAttribute("target")}`
			);
			if (!targetElement) continue;
			const targetElementPosition =
				targetElement.offsetTop -
				header -
				targetElement.getBoundingClientRect().height;
			const scrollPosition = document.body.scrollTop;

			if (scrollPosition >= targetElementPosition) scrolledElem = button;
		}

		if (scrolledElem && !scrolledElem.classList.contains("active")) {
			for (const button of navButtons) button.classList.remove("active");
			scrolledElem.classList.add("active");
		}
	} catch (err) {
		console.error(err);
	}
}

/**
 * Create the link structure display for the inner nav.
 * @param {*} data - The folder structure data compiled with the app.
 */
function createInnerNavStructure(data) {
	try {
		const innerNav = document.querySelector("aside.inner-nav");
		innerNav.innerHTML = `
		<p class="head">On This Page</p>`;

		const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
		const matches = data.match(headingRegex);

		for (const match of matches) {
			const id = match.split('"')[1];
			const headingNum = +match.split("h")[1][0];
			const element = `h${headingNum}`;

			innerNav.innerHTML += match.replace(
				"id=",
				`style="padding-left: ${
					8 + 16 * (headingNum - 1)
				}px;" onclick="handleScroll('${element}#${id}')" target=`
			);
		}

		determineInnerNavPos();
	} catch (err) {
		console.error(err);
	}
}

/**
 * Update the content of the html page.
 * @param {string} data - The new page content.
 */
function updatePageContent(data) {
	const page = document.querySelector("div.article-inner");

	page.innerHTML = data.length > 0 ? data : "<p>Nothing to display.</p>";
}

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
 * Display that the content is loading.
 */
function triggerLoading() {
	document.title = "Loading...";

	updatePageContent(
		`<p class="loading"><ion-icon name="cloud-download-outline"></ion-icon> Loading...</p>`
	);
}

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
			if (path.includes(folder.id.split("_").join("/"))) {
				folder.classList.add("active");
				folder.parentElement.classList.add("open");
			}

		const activeButton = document.querySelector(
			`aside.nav button.file#${
				path.split("/").join("_").split(" ").join("space").split(".")[0]
			}`
		);

		if (activeButton) {
			activeButton.classList.add("active");
		}
	} catch (err) {
		console.error(err);
	}
}

// Handlers

/**
 * Request a file by path.
 * @param {string} path - The path to the file that is being requested.
 */
const handleRequestFile = async (path) => {
	// Trigger loading element.
	triggerLoading();

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

/**
 * Toggle the color theme and update the theme button element.
 * @param {Element} e - The theme button.
 */
const handleToggleTheme = (e) => {
	try {
		const currentTheme = getColorTheme();
		const newTheme = currentTheme === "dark" ? "light" : "dark";

		setColorTheme(newTheme);

		updateColorThemeButton();
	} catch (err) {
		console.error(err);
	}
};

/**
 * Toggle the navbar open and closed.
 */
const handleToggleNav = () => {
	try {
		document
			.querySelector("aside.nav")
			.setAttribute(
				"open",
				!(
					document.querySelector("aside.nav").getAttribute("open") ===
					"true"
				)
			);

		updateNavButton();
	} catch (err) {
		console.error(err);
	}
};

/**
 * Close the navbar.
 */
const handleCloseNav = () => {
	try {
		document.querySelector("aside.nav").setAttribute("open", "false");

		updateNavButton();
	} catch (err) {
		console.error(err);
	}
};

/**
 * Open the search modal.
 */
const handleOpenSearch = () => {
	document
		.querySelector("div.search-modal-container")
		.setAttribute("open", "true");

	const search = document.querySelector("input#search");

	search.value = "";
	search.focus(); // Focus on the searchbar.
};

/**
 * Close the search modal.
 */
const handleCloseSearch = () =>
	document
		.querySelector("div.search-modal-container")
		.setAttribute("open", "false");

/**
 * Stop propagation of a click.
 */
const handleStopPropagation = (e) => e.stopPropagation();
const handlePreventDefault = (e) => e.preventDefault();

// Set up app.
updateColorThemeButton();
updateNavButton();
getFolderTree();

// Add event listeners.
window.addEventListener("keydown", (e) => {
	if (e.key === "Escape") handleCloseSearch();
	if (e.ctrlKey) {
		switch (e.key) {
			case "k":
				handlePreventDefault(e);
				return handleOpenSearch();
			default:
				return;
		}
	}
});

window.onload = () => {
	if (window.location.pathname === "/")
		handleRequestFile("/content/README.html");
	else handleRequestFile(window.location.pathname);
};

document.body.addEventListener("scroll", () => {
	determineInnerNavPos();
	document
		.querySelector("header.page-header")
		.classList.toggle("scrolled", document.body.scrollTop > 0);
});
