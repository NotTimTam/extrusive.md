const fs = require("fs-extra");

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

		const absolutePath = __dirname.replace("\\controllers", path);
		const fileExists = await fs.exists(absolutePath);

		if (!fileExists) return res.status(404).send("File not found.");

		const fileData = await fs.readFile(absolutePath, "utf-8");

		res.status(200).json(fileData);
	} catch (err) {
		console.error(err);
		return res.status(500).send("Unknown server-side error occured.");
	}
};

module.exports = { getFile };
