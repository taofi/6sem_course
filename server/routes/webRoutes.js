const express = require('express');
const router = express.Router();
const webController = require('../controllers/webController');

router.get('/', webController.home);

router.get('/about', webController.about);

router.get('/contact', webController.contact);

module.exports = router;