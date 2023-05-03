const router = require("express").Router();
const { getMarkdownTree } = require("../controllers/markdown");

router.route("/").get(getMarkdownTree);

module.exports = router;
