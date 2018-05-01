"use strict";
const express = require('express');
const router = express.Router();
const UserController = require('./UserController');
const CollectionController = require('./CollectionController');
const BookmarkController = require('./BookmarkController');
const userAccess = require('../middlewares/userAccess');

router.post('/sign-in', UserController.signIn);

router.get('/collection', userAccess, CollectionController.getCollections);
router.post('/collection', userAccess, CollectionController.addCollection);
router.get('/collection/:id', userAccess, CollectionController.getCollectionById);
router.delete('/collection/:id', userAccess, CollectionController.deleteCollectionById);
router.post('/collection/:id/share', userAccess, CollectionController.shareCollectionById);
router.get('/collection/:id/toggle-style', userAccess, CollectionController.toggleStyle);

router.post('/collection/:id/bookmark', userAccess, BookmarkController.createBookmarkByCollectionId);
router.delete('/bookmark/:id', userAccess, BookmarkController.deleteBookmarkById);

module.exports = router;