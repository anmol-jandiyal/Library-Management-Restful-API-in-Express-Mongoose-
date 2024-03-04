const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Book = require("./bookModel");

const userSchema = mongoose.Schema({
	userName: {
		type: String,
		required: true,
		unique: true,
		index: true,
		trim: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: true,
		minlength: [8, "PASSWORD LENGHT MUST BE GREATER OR EQUAL TO 8"],
	},
	bookBorrowed: [
		{
			type: "ObjectID", //for referencing the book in the book db
			ref: Book,
		},
	],
	privilege: {
		type: String,
		enum: ["admin", "user"],
		default: "user",
	},
});

userSchema.pre("save", async function (next) {
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

const User = mongoose.model("user", userSchema);
module.exports = User;
