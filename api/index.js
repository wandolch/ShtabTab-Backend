"use strict";
const router = require('express').Router();
const UserController = require('./UserController');
const userAccess = require('../middlewares/userAccess');

router.post('/signIn', UserController.signIn);

module.exports = router;