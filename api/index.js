"use strict";
const router = require('express').Router();
const UserController = require('./UserController');

router.post('/login', UserController.signIn);

module.exports = router;