/**
 * Replace **all** instances of a searched value in a string with a replacement value.
 * @param {string} string - The string to search.
 * @param {string} searchValue - The string to find.
 * @param {string} replaceValue - The replacement text.
 * @returns {string} The new string.
 */
const replace_all = (string, searchValue, replaceValue) =>
	string.replace(new RegExp(searchValue, "g"), replaceValue);

/**
 * Normalize paths to include forward slashes and no special characters.
 * @param {string} path - The path to normalize.
 * @returns {string} The normalized path.
 */
const normalize_path = (path) => {
	return replace_all(replace_all(path, "\\\\", "/"), "%20", " ");
};

module.exports = { replace_all, normalize_path };
