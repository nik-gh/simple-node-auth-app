const express = require('express');

const router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/users/login');
}

// Members Page
router.get('/', ensureAuthenticated, (req, res) => {
  res.render('index', { title: 'Members' });
});

module.exports = router;
