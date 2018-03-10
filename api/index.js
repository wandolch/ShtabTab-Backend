"use strict";
const router = require('express').Router();
const UserController = require('./UserController');
const CollectionController = require('./CollectionController');
const BookmarkController = require('./BookmarkController');
const userAccess = require('../middlewares/userAccess');

router.post('/sign-in', UserController.signIn);
router.get('/collection', userAccess, CollectionController.getCollections);

router.get('/collection/:id', userAccess, CollectionController.getCollectionById);
router.post('/collection/:id/bookmark', userAccess, BookmarkController.createBookmarkByCollectionId);

module.exports = router;