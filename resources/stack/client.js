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
<button class="file" onclick="handleCloseNav(); handleRequestFile('${path
		.split("\\")
		.join("/")}');" style="padding-left: ${nestLevel * 16 + 16}px;">
	${name}
</button>
`;
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

	// <section>
	// 	<h1>Get Started</h1>
	// 	<button onclick="handleCloseNav()" class="active">
	// 		Quick Start
	// 	</button>
	// 	<button onclick="handleCloseNav()">Installation</button>
	// </section>

	if (children) {
		// Handle folders.

		return `${html} 
			<section>
			${
				nestLevel === 0
					? ""
					: `<h1 style="margin-left: ${16 * nestLevel}px">
					${name}
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

function renderPage(data) {
	const page = document.querySelector("div.article-inner");

	page.innerHTML = data;
}

// Handlers

/**
 * Request a file by path.
 * @param {string} path - The path to the file that is being requested.
 */
const handleRequestFile = async (path) => {
	try {
		const { data } = await axios.get("/api/v1/markdown", {
			params: { path },
		});

		renderPage(data);
	} catch (err) {
		console.error(err);
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
