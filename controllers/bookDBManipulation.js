const { errorMonitor } = require("events");
const bookModel = require("../models/bookModel");

// <-------------------------create----------------------->
function addBook(req, res) {
	const bookData = req.body;

	const bookEntry = new bookModel(bookData);

	bookEntry
		.save()
		.then((entry) => res.status(201).json({ message: "Successful addition of new book", entry: entry }))
		.catch((error) => {
			if (error.code === 11000) {
				bookModel
					.findOneAndUpdate({ title: bookData.title }, { $inc: { count: bookData.count ?? 1 } }, { new: true })
					.then((updatedEntry) => {
						return res.status(200).json({ message: "Successful addition of book count", updatedEntry });
					})
					.catch((error) => {
						return res.status(400).json({
							error: error,
							message: "PROBLEM WHILE UPDATING THE COUNT",
						});
					});
			} else {
				return res.status(400).json(error);
			}
		});
}

// <-------------------------read----------------------->
function getBook(req, res) {
	const title = req.params.title;

	bookModel
		.findOne({ title: title })
		.then((doc) => {
			if (doc) {
				return res.status(200).json(doc);
			}
			return res.status(404).json({ error: "Book NOT FOUND" });
		})
		.catch((error) => {
			return res.status(500).json(error);
		});
}

function getBookList(req, res) {
	bookModel
		.find()
		.then((doc) => {
			if (doc.length > 0) {
				return res.status(200).json(doc);
			}
			return res.status(404).json({ error: "No Book Available" });
		})
		.catch((error) => {
			return res.status(500).json(error);
		});
}

// <-------------------------update----------------------->
function updateBook(req, res) {
	bookModel
		.updateOne({ title: req.params.title }, req.body, { runValidator: true })
		.then((docUpdateInfo) => {
			console.log(docUpdateInfo);

			if (docUpdateInfo.matchedCount === 0) {
				return res.status(404).json({ error: "Book not found" });
			}
			return res.status(200).json({
				message: "UPDATION SUCCESSFUL",
			});
		})
		.catch((error) => {
			return res.status(500).json({
				error: error,
				message: "Problem while updating  the database",
			});
		});
}

// <-------------------------delete----------------------->
function deleteBook(req, res) {
	const title = req.params.title;

	bookModel.deleteOne({ title: title }).then((deleteInfo) => {
		if (deleteInfo.deletedCount === 0) {
			return res.status(404).json({ error: "Book not found" });
		}
		return res.status(200).json({
			message: "Successful deletion",
		});
	});
}

module.exports = {
	addBook,
	getBook,
	getBookList,
	updateBook,
	deleteBook,
};
