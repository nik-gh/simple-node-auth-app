const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://rootdb:rootdb123@ds135776.mlab.com:35776/nodeauthdb');

const db = mongoose.connection;

// User Schema
const UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true,
  },
  password: {
    type: String,
    required: true,
    bcrypt: true,
  },
  email: {
    type: String,
  },
  name: {
    type: String,
  },
  profileimage: {
    type: String,
  },

});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.comparePassword = function (candidatePassowrd, hash, callback) {
  bcrypt.compare(candidatePassowrd, hash, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

module.exports.getUserById = function (id, callback) {
  User.findById(id, callback);
};

module.exports.getUserByUsername = function (username, callback) {
  const query = { username };
  User.findOne(query, callback);
};

module.exports.createUser = function (newUser, callback) {
  bcrypt.hash(newUser.password, 10, (err, hash) => {
    if (err) throw err;

    // Set Hashed password
    newUser.password = hash;

    // Create User
    newUser.save(callback);
  });
};
