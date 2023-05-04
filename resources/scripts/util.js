const fs = require("fs-extra");

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

/**
 * Copy a file or directory to another directory.
 * @param {string} src - The path to the file/directory you want to copy.
 * @param {string} dest - The path to the destination.
 * @param {string} type - The type of source being copied. Should be either "file" or "directory"
 */
const copy_path = async (src, dest, type = "file") => {
	if (!(await fs.exists(src)))
		throw `"${src.split("/")[1]}" ${type} does not exist.`;
	await fs.copy(src, dest);
};

module.exports = { replace_all, normalize_path, copy_path };
