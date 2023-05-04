const fs = require("fs-extra");
const searchIndices = require("../util/searchIndices");

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
GET FILE
.get('/')
req.query {
	path
} 
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
const getFile = async (req, res) => {
	const { path } = req.query;

	try {
		if (!path)
			return res.status(403).send("The path request must be provided.");

		const absolutePath = __dirname
			.replace("\\controllers", path.replace(new RegExp("%20", "g"), " "))
			.replace("/controllers", path.replace(new RegExp("%20", "g"), " "));
		const fileExists = await fs.exists(absolutePath);

		if (!fileExists) return res.status(404).send("File not found.");

		const fileData = await fs.readFile(absolutePath, "utf-8");

		res.status(200).json(fileData);
	} catch (err) {
		console.error(err);
		return res.status(500).send("Unknown server-side error occured.");
	}
};

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
SEARCH FILE
.get('/search')
req.query {
	query
}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
const searchFiles = async (req, res) => {
	const { query } = req.query;
	try {
		if (!query) return res.status(403).send("No query sent.");

		res.status(200).json(
			searchIndices
				.filter(
					({ path, data }) =>
						path.toLowerCase().includes(query.toLowerCase()) ||
						data.includes(query.toLowerCase())
				)
				.map(({ path }) => path)
		);
	} catch (err) {
		console.error(err);
		return res.status(500).send("Unknown server-side error occured.");
	}
};

module.exports = { getFile, searchFiles };
