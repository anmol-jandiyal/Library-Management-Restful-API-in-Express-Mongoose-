const express = require("express");
const userRouter = express.Router();

const userController = require("../controllers/userController");

userRouter.post("/signup", userController.userSignUp);
userRouter.post("/login", userController.anyOneLoggedIn, userController.userLogin);
userRouter.post("/logout", userController.userLogOut);

module.exports = userRouter;
