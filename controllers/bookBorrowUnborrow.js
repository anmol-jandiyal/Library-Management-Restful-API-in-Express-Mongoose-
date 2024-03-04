//check in the cookies or local storage who is currently logged in and then perform manupulation no the books
const Book = require("../models/bookModel");
const User = require("../models/userModel");
const auth = require("../controllers/auth");

async function borrowBook(req, res) {
	const title = req.params.title;

	try {
		const bookInfo = await Book.findOne({ title: title });

		//check if book exist or not and if exist then is available or not
		if (bookInfo && bookInfo.count >= 1) {
			//add the book obj id to users that is currently logged in
			const uid = req.cookies.uid;
			const loggedUserId = auth.getUser(uid)._id;

			const updateInfo = await User.updateOne({ _id: loggedUserId }, { $addToSet: { bookBorrowed: bookInfo._id } });

			if (updateInfo.modifiedCount === 0) {
				// if no modification happens it means book already borrowed
				return res.status(409).json({ MESSAGE: "Already Borrowed" });
			}

			//if book borrowed successfully then update the book collection
			await Book.updateOne({ _id: bookInfo._id }, { $inc: { count: -1 } });

			return res.status(200).json({
				MESSAGE: "Successfully borrowed ",
				book: {
					title: title,
					author: bookInfo.author,
					description: bookInfo.description,
				},
			});
		}
		return res.status(404).json({ error: "book not found or currently unavailable" });
	} catch (err) {
		console.log(err);
		return res.status(500).json({ error: err });
	}
}

async function returnBook(req, res) {
	const title = req.params.title;

	try {
		const bookInfo = await Book.findOne({ title: title });

		if (bookInfo) {
			//also check if the user currently logged in have same book or not
			const uid = req.cookies.uid;
			const loggedUserId = auth.getUser(uid)._id;

			const updateInfo = await User.updateOne({ _id: loggedUserId }, { $pull: { bookBorrowed: bookInfo._id } });

			if (updateInfo.modifiedCount === 0) {
				return res.status(409).json({ MESSAGE: `Book with title : '${title}' was not borrowed` });
			}

			await Book.updateOne({ title: title }, { $inc: { count: 1 } });

			return res.status(200).json({
				MESSAGE: "Successfully returned",
				book: {
					title: title,
					author: bookInfo.author,
					description: bookInfo.description,
				},
			});
		}
		return res.status(403).json({ error: `Cannot find any book with title '${title}' in the database` });
	} catch (err) {
		return res.status(500).json({ error: err });
	}
}

async function borrowedList(req, res) {
	//extracting the user ObjectId in order to access the data from the database
	const userId = auth.getUser(req.cookies.uid)._id;

	try {
		const userInfo = await User.findOne({ _id: userId }, { bookBorrowed: 1 }).populate("bookBorrowed", { author: 1, title: 1, description: 1 });

		const borrowedBook = userInfo.bookBorrowed;

		if (borrowedBook.length === 0) return res.status(404).json({ Message: "No book borrowed" });

		return res.status(200).json(borrowedBook);
	} catch (err) {
		return res.status(500).json({ error: err });
	}
}

module.exports = { borrowBook, returnBook, borrowedList };
