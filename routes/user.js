const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const checkAuth = require("../middlewares/checkAuth");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/recover", userController.recover);
router.get("/fetchAllUsers", checkAuth, userController.fetchAllUsers);
router.post("/addFriend", checkAuth, userController.addFriend);
router.get("/fetchFriends", checkAuth, userController.fetchFriends);

module.exports = router;
