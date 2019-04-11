const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

const router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
  res.send('respond with a resource');
});

router.get('/register', (req, res) => {
  res.render('register', {
    title: 'Register',
  });
});

router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login',
  });
});

router.post('/register', (req, res) => {
  const { name } = req.body;
  const { email } = req.body;
  const { username } = req.body;
  const { password } = req.body;
  const { password2 } = req.body;
  
  let profileImageName;
  // Check for Image Field
  if (req.files && req.files.profileimage) {
    console.log('uploading File...');

    // File Info
    const profileImageOriginalName = req.files.profileimage.originalname;
    profileImageName = req.files.profileimage.name;
    const profileImageMime = req.files.profileimage.mimetype;
    const profileImagePath = req.files.profileimage.path;
    const profileImageExt = req.files.profileimage.extension;
    const profileImageSize = req.files.profileimage.size;
  } else {
    // Set a Default Image
    profileImageName = 'noimage.png';
  }

  // Form Validation
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('email', 'Email not valid').isEmail();
  req.checkBody('username', 'Username field is required').notEmpty();
  req.checkBody('password', 'Password field is required').notEmpty();
  req.checkBody('password2', 'Password do not match').equals(req.body.password);

  // Check for errors
  const errors = req.validationErrors();

  if (errors) {
    res.render('register', {
      errors,
      name,
      email,
      username,
      password,
      password2,
    });
  } else {
    const newUser = new User({
      name,
      email,
      username,
      password,
      profileimage: profileImageName,
    });

    // Create User
    User.createUser(newUser, (err, user) => {
      if (err) throw err;
      console.log(user);
    });

    // Success Message
    req.flash('success', 'You are now registered and may log in');

    res.location('/');
    res.redirect('/');
  }
});

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.getUserById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  ((username, password, done) => {
    User.getUserByUsername(username, (err, user) => {
      if (err) throw err;
      if (!user) {
        console.log('Unknown User');
        return done(null, false, { message: 'Unknown User' });
      }

      User.comparePassword(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        }
        console.log('Invalid Password');
        return done(null, false, { message: 'Invalid Password' });
      });
    });
  }),
));

router.post('/login', passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: 'Invalid username or password' }), (req, res) => {
  console.log('Authentication Successful');
  req.flash('success', 'You are logged in');
  res.redirect('/');
});

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You have logged out');
  res.redirect('/users/login');
});

module.exports = router;
