const express = require("express");
const mongoose = require("mongoose");
const bookRouter = require("./routes/bookRoute");
const userRouter = require("./routes/userRoute");
const cookieParser = require("cookie-parser");

const PORT = 8080;
const URL = "mongodb://localhost:27017/mydb";

const server = express();
server.use(express.json());
server.use(cookieParser()); //to work with cookies

server.use("/books", bookRouter);
server.use("/users", userRouter);

mongoose
	.connect(URL)
	.then(() => {
		console.log("CONNECTION TO DATABASE ESTABLISHED");
		server.listen(PORT, (err) => {
			if (err) {
				console.log(err);
			} else {
				console.log("SERVER STARTED");
			}
		});
	})
	.catch((err) => {
		console.log("PROBLEM WILL CONNECTING TO SERVER");
	});
