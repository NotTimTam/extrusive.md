// Functions

/**
 * Create a short pop-up message that stays on screen for a certain amount of time.
 * @param {string} message - The message to display in the popup.
 * @param {"info"||"warning"||"error"||"success"} type - The type of message it is.
 */
function createPopup(message, type = "info") {
	try {
		const popupContainer = document.querySelector("div.popup-container");

		while (popupContainer.childNodes.length >= 5) {
			try {
				popupContainer.removeChild(popupContainer.childNodes[0]);
			} catch (err) {}
		}

		const deletePopup = () => {
			try {
				if (popupContainer) popupContainer.removeChild(popup);
			} catch (err) {}
		};

		const popup = createElement(
			"div",
			[["className", `pop-up ${type}`]],
			null,
			null,
			message
		);

		popup.appendChild(
			createElement(
				"button",
				null,
				null,
				[["click", deletePopup]],
				`<ion-icon name="close-outline"></ion-icon>`
			)
		);

		popupContainer.appendChild(popup);

		// Remove the popup after five seconds.
		setTimeout(deletePopup, 5000);
	} catch (err) {
		console.error("Failed to create popup:", err);
	}
}

/**
 * Creates and returns an HTML element.
 * @param {string} tagName - The tag name for the element.
 * @param {Array<Array<string>>} props - An array of properties to directly set on the object. `[..., [propName, value]]`
 * @param {Array<Array<string>>} attributes - An array of attributes to add to the element with `.setAttribute()`. `[..., [attrName, value]]`
 * @param {Array<Array<string>>} attributes - An array of event listeners to add to the element with `.setAttribute()`. `[..., [type, listener]]`
 * @returns {Element} The newly created DOM element.
 */
function createElement(
	tagName,
	props,
	attributes,
	eventListeners,
	innerHTML = null
) {
	try {
		const element = document.createElement(tagName);

		if (innerHTML) element.innerHTML = innerHTML;

		if (props) for (const [prop, value] of props) element[prop] = value;
		if (attributes)
			for (const [attr, value] of attributes)
				element.setAttribute(attr, value);
		if (eventListeners)
			for (const [type, listener] of eventListeners)
				element.addEventListener(type, listener);

		return element;
	} catch (err) {
		console.error("Failed to generate element:", err);
	}
}

/**
 * Append a series of elements to a parent element.
 * @param {Element} parent - The parent to append the elements to.
 * @param  {...Element} elements - The elements to append.
 */
function appendElements(parent, ...elements) {
	try {
		for (const element of elements) {
			parent.appendChild(element);
		}
	} catch (err) {
		console.error("Failed to append child elements:", err);
	}
}

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
	}px;" id="file-${
		path.split("/").join("_").split(" ").join("S20S").split(".")[0]
	}">
	<ion-icon name="document-outline"></ion-icon>
	${name.split(".html")[0]}
</button>
`;
}

/**
 * Toggle the dropdown of a folder menu.
 * @param {string} folder - The identifier of the folder to toggle.
 */
function toggleNavDropdown(folder) {
	try {
		document
			.querySelector(
				`section#folder-${folder
					.split("%20")
					.join("S20S")
					.split(" ")
					.join("S20S")}`
			)
			.classList.toggle("open");
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
			<section depth="${nestLevel}" class="folder" id="${`folder-${name}-${nestLevel}`
			.split("%20")
			.join("S20S")
			.split(" ")
			.join("S20S")}">
			${
				nestLevel === 0
					? ""
					: `<h1 id="folder-${
							path
								.split("/")
								.join("_")
								.split("%20")
								.join("S20S")
								.split(" ")
								.join("S20S")
								.split(".")[0]
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

		if (navButtons.length === 1) {
			return navButtons[0].classList.add("active");
		}

		for (const button of navButtons) {
			const targetElement = document.querySelector(
				button.getAttribute("target")
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
 * Create the link structure display for the inner nav and quick links.
 * @param {*} data - The folder structure data compiled with the app.
 */
function createInnerNavStructure(data) {
	try {
		const innerNav = document.querySelector("aside.inner-nav");
		innerNav.innerHTML = `
		<p class="head">On This Page</p>`;

		const headingRegex =
			/<h[1-6][^>]*?(?:id="([^"]*)")[^>]*?>(.*?)<\/h[1-6]>/gi;
		const matches = data.match(headingRegex);

		if (!matches || matches.length < 1) return (innerNav.innerHTML = null);

		for (const match of matches) {
			if (!match.includes("id")) continue;
			const id = match.split('"')[1];
			const headingNum = +match.split("h")[1][0];
			const element = `h${headingNum}`;
			const content = match.split(">")[1];

			const elementQuery = `${element}#${id}`;

			const realElement = document.querySelector(
				`div.article-inner ${elementQuery}`
			);

			// Create anchor hook.
			if (realElement) {
				const anchorTrigger = () => {
					handleScroll(elementQuery);

					navigator.clipboard.writeText(window.location.href);

					// Create a pop-up message.
					createPopup("URL copied to clipboard.", "success");
				};
				const anchor = createElement(
					"div",
					[["className", "anchor"]],
					null,
					[["click", anchorTrigger]],
					`<ion-icon name="link-outline"></ion-icon>`
				);

				realElement.appendChild(anchor);
			}

			innerNav.innerHTML += `<${element} target="${element}#${id}" style="padding-left: ${
				8 + 16 * (headingNum - 1)
			}px;" onclick="handleScroll('${elementQuery}')">${content}`;
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
 * Update the content section of the search modal to new data.
 * @param {...Element} elements - An array of elements to append to the search modal.
 */
function updateSearchContent(...elements) {
	try {
		const searchModalContent = document.querySelector("div.search-content");
		searchModalContent.innerHTML = null;

		appendElements(searchModalContent, ...elements);
	} catch (err) {
		console.error("Failed to update search modal content:", err);
	}
}

/**
 * Save a search.
 */
function saveRecentSearch(path) {
	try {
		let recentSearches = localStorage.getItem("recentSearches");
		if (recentSearches) recentSearches = JSON.parse(recentSearches);
		else recentSearches = [];

		if (!recentSearches.includes(path)) recentSearches.push(path);

		while (recentSearches > 5) recentSearches.shift();

		localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
	} catch (err) {
		console.error("Failed to save recent search:", err);
	}
}

/**
 * Clear all recent searches from storage.
 */
function clearRecentSearches() {
	try {
		localStorage.removeItem("recentSearches");
		displayRecentSearches();
	} catch (err) {
		console.error("Failed to clear recent searches:", err);
	}
}

/**
 * Unfocus all focused search result buttons.
 */
function clearFocusedResultButtons() {
	try {
		const allButtons = document.querySelectorAll(
			"div.search-content button.file-result[isfocused='true']"
		);
		allButtons.forEach((button) =>
			button.setAttribute("isfocused", "false")
		);
	} catch (err) {
		console.error("Failed to clear search result button focus:", err);
	}
}

/**
 * Focus on a particular search result button.
 * @param {Element} button - The button to focus on.
 */
function focusResultButton(button) {
	try {
		clearFocusedResultButtons(); // Clear any currently focused buttons.

		button.setAttribute("isfocused", "true");
	} catch (err) {
		console.error("Failed to focus on a search result button:", err);
	}
}

/**
 * Focus on the result button that is 'n' adjacent to the current search button.
 * @param {Element} button - The button to focus on.
 * @param {number} n - The direction to move in. (loops)
 */
function focusNResultButton(button, n = 1) {
	try {
		const resultButtons = Array.from(
			document.querySelectorAll("div.search-content button.file-result")
		);

		const index = resultButtons.indexOf(button);

		clearFocusedResultButtons(); // Clear any currently focused buttons.

		// If the button isn't focused, we return.
		if (
			!(typeof index === "number") ||
			!Boolean(button.getAttribute("isfocused"))
		)
			return clearFocusedResultButtons();

		// Calculate and focus on new index.
		const newIndex =
			index + n < 0
				? resultButtons.length - 1
				: index + n > resultButtons.length - 1
				? 0
				: index + n;
		resultButtons[newIndex].setAttribute("isfocused", "true");
	} catch (err) {
		console.error("Couldn't focus on result button:", err);
	}
}

/**
 * Display previous search results.
 */
function displayRecentSearches() {
	let recentSearches = localStorage.getItem("recentSearches");
	if (recentSearches) recentSearches = JSON.parse(recentSearches);
	else recentSearches = [];

	if (recentSearches && recentSearches.length > 0) {
		const recentSearchesParent = createElement("div", [
			["className", "recent-searches"],
			[
				"innerHTML",
				`<header><h1>Recent</h1><button class="clear" onclick="clearRecentSearches()">Clear</button></header>`,
			],
		]);

		recentSearches.forEach((path) => {
			// Create a button.
			const buttonElement = createElement(
				"button",
				[["className", "file-result"]],
				[["isfocused", false]],
				[
					[
						"click",
						() => {
							handleCloseSearch();
							handleRequestFile(path);
						},
					],
				]
			);

			// Create button content element.
			const buttonContent = createElement(
				"div",
				null,
				null,
				null,
				`<ion-icon size="large" name="time-outline"></ion-icon>
			<span class="inner">
				<p>
					${path.split("/")[path.split("/").length - 1].split(".")[0]}
				</p>
				<h6>${path}</h6>
			</span>`
			);

			// Add all button content.
			appendElements(
				buttonElement,
				buttonContent,
				createElement("ion-icon", [
					["name", "return-down-back-outline"],
				])
			);

			recentSearchesParent.appendChild(buttonElement);
		});

		updateSearchContent(recentSearchesParent);
	} else {
		const noRecentSearches = createElement(
			"div",
			[["className", "no-results"]],
			null,
			null,
			`<h6>
				No recent searches
			</h6>`
		);

		updateSearchContent(noRecentSearches);
	}
}

/**
 * Display search results.
 * @param {Object} data - The data from which to create the search results.
 */
function displaySearchResults(data) {
	if (data && data.length > 0) {
		const searchResultsParent = createElement(
			"div",
			[["className", "results"]],
			null,
			null,
			`<header><h1>Results</h1></header>`
		);

		data.forEach((path) => {
			// Create a button.
			const buttonElement = createElement(
				"button",
				[["className", "file-result"]],
				[["isfocused", false]],
				[
					[
						"click",
						() => {
							saveRecentSearch(path);
							handleCloseSearch();
							handleRequestFile(path);
						},
					],
				]
			);

			// Create button content element.
			const buttonContent = createElement(
				"div",
				null,
				null,
				null,
				`<ion-icon name="document-outline" size="large"></ion-icon>
				<span class="inner">
					<p>
						${path.split("/")[path.split("/").length - 1].split(".")[0]}
					</p>
					<h6>${path}</h6>
				</span>`
			);

			// Add all button content.
			appendElements(
				buttonElement,
				buttonContent,
				createElement("ion-icon", [
					["name", "return-down-back-outline"],
				])
			);

			searchResultsParent.appendChild(buttonElement);
		});

		updateSearchContent(searchResultsParent);
	} else {
		const query = document.querySelector(
			"div.search-bar input#search"
		).value;

		const noResults = createElement(
			"div",
			[["className", "no-results"]],
			null,
			null,
			`<ion-icon name="close-outline" size="64"></ion-icon>

			<p class="query">
				No results for "${query}"
			</p>

			<h6>
				Believe this query should return results? Let us know.
			</h6>`
		);

		updateSearchContent(noResults);
	}
}

/**
 * Display that the content is loading.
 */
function triggerLoadingArticleContent() {
	document.title = "Loading...";

	updatePageContent(`<div class="loading"></div>`);
}

/**
 *
 * @param {Boolean} isMac - Whether the platform is a mac or not.
 */
function configurePlatformSpecificContent(isMac = false) {
	try {
		if (isMac) {
			document
				.querySelectorAll("kbd#special-command-key")
				.forEach(
					(specialCommandKey) => (specialCommandKey.innerHTML = `⌘`)
				);
		}
	} catch (err) {
		console.error("Could not configure platform specific code.", err);
	}
}

// Handlers

const handleCopyCode = (element) => {
	try {
		const data = element.parentNode.innerText.replace(
			element.innerText,
			""
		);
		navigator.clipboard.writeText(data);

		// Create a pop-up message.
		createPopup("Code copied to clipboard.", "success");
	} catch (err) {
		console.error("Failed to copy code:", err);
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

	displayRecentSearches(); // Load previous searches
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

const platformIsMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
configurePlatformSpecificContent(platformIsMac);

// Add event listeners.
window.addEventListener("keydown", (e) => {
	if (e.key === "Escape") handleCloseSearch();

	const isCtrlKey = platformIsMac ? e.metaKey : e.ctrlKey;

	if (isCtrlKey) {
		// When ctrl key is held.
		switch (e.key) {
			case "k":
				handlePreventDefault(e);
				return handleOpenSearch();
			default:
				return;
		}
	} else {
		const searchModalContainer = document.querySelector(
			"div.search-modal-container"
		);

		// If the search modal is open.
		if (searchModalContainer.getAttribute("open") === "true") {
			const focusedButton = searchModalContainer.querySelector(
				"div.search-content button.file-result[isfocused='true']"
			);

			switch (e.key) {
				case "Enter":
					// If the user hits "Enter" when a button is focused.
					if (focusedButton) focusedButton.click();
					else
						focusResultButton(
							searchModalContainer.querySelector(
								"div.search-content button.file-result:first-of-type"
							)
						);
					return;
				case "ArrowUp":
					if (focusedButton) focusNResultButton(focusedButton, -1);
					else {
						const hoveredButton = document.querySelector(
							"div.search-content button.file-result:hover"
						);

						if (hoveredButton)
							focusNResultButton(hoveredButton, -1);
						else
							focusResultButton(
								searchModalContainer.querySelector(
									"div.search-content button.file-result:last-of-type"
								)
							);
					}
					return;
				case "ArrowDown":
					if (focusedButton) focusNResultButton(focusedButton, 1);
					else {
						const hoveredButton = document.querySelector(
							"div.search-content button.file-result:hover"
						);
						if (hoveredButton) focusNResultButton(hoveredButton, 1);
						else
							focusResultButton(
								searchModalContainer.querySelector(
									"div.search-content button.file-result:first-of-type"
								)
							);
					}
					return;
				default:
					return;
			}
		}
	}
});

document
	.querySelector("div.search-modal div.search-content")
	.addEventListener("mousemove", (e) => {
		clearFocusedResultButtons();
	});

document.body.addEventListener("scroll", () => {
	determineInnerNavPos();
	document
		.querySelector("header.page-header")
		.classList.toggle("scrolled", document.body.scrollTop > 0);
});
