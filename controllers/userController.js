const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const UserModel = require("../models/user");
const config = require("../configuration/config");
const utils = require("../utilities/utils");

exports.signup = (req, res, next) => {
  const { firstName, lastName, userId, password, securityQ, securityA } = req.body;
  bcrypt.hash(password, 10).then((hash) => {
    if (!userId || !password) utils.sendErrorResponse(res, 401, "Error!", "Please enter all the required fields.");
    const user = new UserModel({
      firstName: firstName,
      lastName: lastName,
      userId: userId,
      password: hash,
      securityQ: securityQ,
      securityA: securityA,
    });

    user.save((err, result) => {
      if (err) {
        utils.sendErrorResponse(res, 400, err.name, err.message);
      } else {
        utils.sendSuccessResponse(res, 201, "Account created successfully!", null);
      }
    });
  });
};

exports.login = (req, res, next) => {
  const { userId, password } = req.body;
  UserModel.findOne({ userId: userId }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password).then((result) => {
        if (result) {
          try {
            const obj = { userId: user.userId, userId: user._id };
            const token = jwt.sign(obj, config.secret_key, { expiresIn: 3600 });
            utils.sendSuccessResponse(res, 200, "Login successful!", {
              access_token: token,
              expiresIn: 3600,
              current_user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, userId: user.userId },
            });
          } catch (err) {
            console.log(err);
          }
        } else {
          utils.sendErrorResponse(res, 401, "Unauthorized!", "Incorrect password!");
        }
      });
    } else {
      utils.sendErrorResponse(res, 401, "Unauthorized!", "Incorrect UserId!");
    }
  });
};

exports.recover = (req, res, next) => {
  // TO DO: password recovery using security Question
};
