"use strict";
const router = require('express').Router();
const UserController = require('./UserController');
const userAccess = require('../middlewares/userAccess');

router.post('/signIn', UserController.signIn);
router.get('/collections', userAccess, (req, res)=>{
  const arr = require('../json/collections.json');
  res.json(arr);
});

router.get('/bookmarks/0', userAccess, (req, res) => {
  const arr = require('../json/bookmarks0.json');
  res.json(arr);
});

router.get('/bookmarks/1', userAccess, (req, res) => {
  const arr = require('../json/bookmarks1.json');
  res.json(arr);
});

module.exports = router;