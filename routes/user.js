const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const checkAuth = require("../middlewares/checkAuth");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/recover", userController.recover);
router.get("/fetchAll", checkAuth, userController.fetchAll);
router.post("/addFriend", checkAuth, userController.addFriend);
router.get("/getFriends", checkAuth, userController.getFriends);

module.exports = router;
