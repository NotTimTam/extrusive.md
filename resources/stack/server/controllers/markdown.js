const dirTree = require("directory-tree");

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
GET MARKDOWN TREE
.get('/') 
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
const getMarkdownTree = async (req, res) => {
	try {
		const tree = dirTree(__dirname.replace("\\controllers", "\\content"));

		res.status(200).json(tree);
	} catch (err) {
		console.error(err);
		return res.status(500).send("Unknown server-side error occured.");
	}
};

module.exports = { getMarkdownTree };
