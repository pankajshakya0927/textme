const bcrypt = require("bcrypt");

const UserModel = require("../models/user");
const utils = require("../utilities/utils");
const generateToken = require("../middlewares/authorization");

exports.signup = (req, res, next) => {
  const { firstName, lastName, username, password, securityQ, securityA } = req.body;
  UserModel.findOne({ username: username }).then((user) => {
    if (user) utils.sendErrorResponse(res, 401, "Validation Error", "Username already exists!");
    else {
      bcrypt.hash(password, 10).then((hash) => {
        if (!username || !password) utils.sendErrorResponse(res, 401, "Error!", "Please enter all the required fields.");
        const user = new UserModel({
          firstName: firstName,
          lastName: lastName,
          username: username,
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
    }
  });
};

exports.login = (req, res, next) => {
  const { username, password } = req.body;
  UserModel.findOne({ username: username }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password).then((result) => {
        if (result) {
          try {
            const token = generateToken(user._id);
            utils.sendSuccessResponse(res, 200, "Login successful!", {
              access_token: token,
              expiresIn: 3600,
              current_user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, username: user.username },
            });
          } catch (err) {
            console.log(err);
          }
        } else {
          utils.sendErrorResponse(res, 401, "Unauthorized!", "Incorrect password!");
        }
      });
    } else {
      utils.sendErrorResponse(res, 401, "Unauthorized!", "Incorrect username!");
    }
  });
};

exports.recover = (req, res, next) => {
  // TO DO: password recovery using security Question
};
