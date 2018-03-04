"use strict";
const router = require('express').Router();
const UserController = require('./UserController');

router.post('/signIn', UserController.signIn);

module.exports = router;