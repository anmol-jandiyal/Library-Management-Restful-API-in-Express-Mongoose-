const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
	title: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
	author: { type: String, required: true, trim: true, lowercase: true },
	description: { type: String },
	count: {
		type: Number,
		min: [0, "no. of book cannot be below 0"],
		default: 1,
	},
});

const Book = mongoose.model("book", bookSchema);
module.exports = Book;
