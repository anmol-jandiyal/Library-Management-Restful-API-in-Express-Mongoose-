const User = require("../models/userModel");
const auth = require("../controllers/auth");
const bcrypt = require("bcrypt");
const { default: mongoose } = require("mongoose");

//<-------------TO ADD NEW USER TO THE USER DATABASE-------------->
async function userSignUp(req, res) {
	const userData = req.body;

	const newUser = new User(userData);

	/* 	//checking if same userName present or not
	try {
		// userData.userName may be undefined if not present in the body
		//in that case also we cannot  find any entry in database with field userName=undefined
		const userDoc = await User.findOne({ userName: userData.userName });
		if (userDoc) {
			return res.status(409).json({ error: "same userName already present" });
		}
	} catch (error) {
		return res.status(500).json({ error: "Internal server error" });
	}
 */

	newUser
		.save()
		.then((doc) => {
			return res.status(201).json({ MESSAGE: "Successful Addition", doc: doc });
		})
		.catch((error) => {
			if (error.code === 11000) {
				return res.status(409).json({ error: "Same userName already present" });
			}
			return res.status(400).json(error);
		});
}

//<-------------LOGIN TO THE USER PROFILE (TO GET ACCESS OF BOOKS HE/SHE BORROWED)-------------->
async function userLogin(req, res) {
	const loginData = req.body;

	//checking if userName and password present in the body or not
	if (loginData.userName && loginData.password) {
		try {
			const userDoc = await User.findOne({ userName: loginData.userName });

			if (userDoc) {
				const validateBool = await bcrypt.compare(loginData.password, userDoc.password);

				if (validateBool) {
					const token = auth.setUser(userDoc);
					res.cookie("uid", token);

					return res.status(200).json({ user: { userName: userDoc.userName, privilege: userDoc.privilege }, message: "successful login" });
				}
				return res.status(401).json({ error: "Invalid password" });
			} else {
				return res.status(404).json({ Error: "user not found" });
			}
		} catch (error) {
			console.log(error);
			return res.status(500).json({ error: error });
		}
	} else {
		return res.status(400).json({ Error: "Invalid request", Message: "Request must contain userName and password " });
	}
}

//<-------------LOG OUT -------------->

function userLogOut(req, res) {
	const uid = req.cookies.uid;

	if (uid) {
		res.clearCookie("uid");
		return res.status(200).json({ message: "successful loggout" });
	}

	res.status(400).json({ Message: "Already logged out! No user have logged in" });
}

//<-------------------------checking if any user is loggin  or not ------------------------------>
function anyOneLoggedIn(req, res, next) {
	const uid = req.cookies.uid;

	if (uid) {
		//if uid is presnet then not allow any user untlil previous user logout
		/* 
                The HTTP 403 status code indicates that the server understood the request but refuses to authorize it. In the context of a login operation, it signifies that the user's credentials are valid, but they are not permitted to log in for some reason (e.g., insufficient permissions, account locked, etc.).
                 */
		return res.status(409).json({ message: "Not able to login because other user already logged in" });
	}

	next();
}

// <--------to restrict the services that are allowed to logged user only---------------------->
async function restrictToLoggedUser(req, res, next) {
	const uid = req.cookies.uid;

	if (!uid) {
		//redirect the user to login to access the his/her profile
		return res.status(307).json({ message: "Please login before You access the any services", redirect: "redirection to login page" });
	}

	//if uid exist then check if uid is associates to any user or not
	const user = auth.getUser(uid);

	// check if user is valid or not
	try {
		const userDoc = await User.findById(user._id);

		if (!userDoc) {
			return res.status(401).json({ Message: "unauthorized access!  Please log in again." });
		}
	} catch (err) {
		return res.status(500).json({ error: err });
	}

	next();
}

//<------------------to restrict admin to perform operations like add remove or update book information-------------------------------------------->

async function authorized(req, res, next) {
	const uid = req.cookies.uid;

	const user = auth.getUser(uid);

	try {
		const userDoc = await User.findById(user._id);

		if (userDoc && userDoc.privilege !== "admin") {
			return res.status(401).json({ Message: "unauthorized access! " });
		}
	} catch (err) {
		return res.status(500).json({ error: err });
	}
	next();
}
module.exports = { userLogin, userSignUp, userLogOut, anyOneLoggedIn, restrictToLoggedUser, authorized };
