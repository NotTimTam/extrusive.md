const router = require("express").Router();
const { getFile } = require("../controllers/markdown");

router.route("/").get(getFile);

module.exports = router;
