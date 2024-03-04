const jwt = require("jsonwebtoken");
const secretKey = "anmoljandiyal";

function setUser(user) {
	const { _id, userName } = user; //only storing the id and the userName in the token which can be used in future to extract the data

	return jwt.sign({ _id, userName }, secretKey);
}

function getUser(token) {
	try {
		const user = jwt.verify(token, secretKey);
		return user;
	} catch (err) {
		console.log("error while extracting the user from token because of invalid key");
		return null;
	}
}

module.exports = { setUser, getUser };
