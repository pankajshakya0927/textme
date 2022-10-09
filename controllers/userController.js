const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserModel = require("../models/user");
const utils = require("../utilities/utils");
const config = require("../configuration/config");

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
            const obj = { username: username, userId: user._id };
            const token = jwt.sign(obj, config.secret_key);
            utils.sendSuccessResponse(res, 200, "Login successful!", {
              access_token: token,
              current_user: { firstName: user.firstName, lastName: user.lastName, username: user.username },
            });
          } catch (err) {
            console.log(err);
          }
        } else {
          utils.sendErrorResponse(res, 401, "Unauthorized", "Incorrect password!");
        }
      });
    } else {
      utils.sendErrorResponse(res, 401, "Unauthorized", "Incorrect username!");
    }
  });
};

exports.recover = (req, res, next) => {
  // TO DO: password recovery using security Question
};

exports.update = (req, res, next) => {
  // TO DO: Profile update
};

exports.fetchAllUsers = (req, res, next) => {
  const currentUser = req.currentUser;
  try {
    UserModel.find({ username: { $ne: currentUser.username } },
      (err, users) => {
        let usernames = [];
        users.forEach((user) => {
          usernames.push(user.username);
        });

        utils.sendSuccessResponse(res, 200, "Users fetched successfully", usernames);
      },
      (err) => {
        utils.sendErrorResponse(res, 400, "Error", "Failed to fetch usernames");
      }
    );
  } catch (error) {
    console.log(error);
  }
};

exports.addFriend = (req, res, next) => {
  const { username } = req.body;
  const currentUser = req.currentUser;

  UserModel.findOne({ username: username }).then((user) => {
    const { password, friends, securityQ, securityA, updatedAt, ...friend } = user.toObject();
    if (user) {
      UserModel.findOneAndUpdate({ username: currentUser.username }, { $addToSet: { friends: friend } }).then((success, error) => {
        if (success) {
          UserModel.findOne({ username: currentUser.username }).then((user) => {
            let friends = [];
            if (user && user.friends) {
              user.friends.forEach((friend) => {
                friends.push(friend.username);
              });
            }
            utils.sendSuccessResponse(res, 200, "Friend added successfully", friends);
          });
        } else {
          utils.sendErrorResponse(res, 400, "Error", "Failed to add friend");
        }
      });
    }
  });
};

exports.fetchFriends = (req, res, next) => {
  const { username } = req.currentUser;

  UserModel.findOne({ username: username }).then((user) => {
    if (user) {
      try {
        let friends = [];
        if (user && user.friends) {
          user.friends.forEach((friend) => {
            friends.push(friend.username);
          });
        }
        utils.sendSuccessResponse(res, 200, "Friends fetched successfully", friends);
      } catch (error) {
        utils.sendErrorResponse(res, 400, "Error", "Failed to fetch friends");
      }
    }
  });
};
