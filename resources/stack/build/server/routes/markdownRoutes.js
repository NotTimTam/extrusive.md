const router = require("express").Router();
const { getFile, searchFiles } = require("../controllers/markdown");

router.route("/").get(getFile);
router.route("/search").get(searchFiles);

module.exports = router;
