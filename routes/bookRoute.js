const express = require("express");

const bookCrud = require("../controllers/bookDBManipulation");
const borrowUnborrow = require("../controllers/bookBorrowUnborrow");
const userController = require("../controllers/userController");

const bookRoute = express.Router();
bookRoute.use(userController.restrictToLoggedUser);

//<--------borrowing and return book route----------->
bookRoute.get("/borrow/:title", borrowUnborrow.borrowBook);
bookRoute.patch("/return/:title", borrowUnborrow.returnBook);

//<-------------TO GET LIST TO BORROWED BOOKS----------->
bookRoute.get("/borrowed/", borrowUnborrow.borrowedList);

// <-------list of books avaliable in the database------------------------>
bookRoute.get("/:title", bookCrud.getBook);
bookRoute.get("/", bookCrud.getBookList);

// <-------Admin operations------------------------>
bookRoute.post("/", userController.authorized, bookCrud.addBook);
bookRoute.patch("/:title", userController.authorized, bookCrud.updateBook);
bookRoute.delete("/:title", userController.authorized, bookCrud.deleteBook);

module.exports = bookRoute;
