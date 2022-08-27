const jwt = require("jsonwebtoken");
const config = require("../configuration/config");

exports.generateToken = (id) => {
    return jwt.sign(id, config.secret_key, { expiresIn: 3600 });
}