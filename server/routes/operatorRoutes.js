const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');


router.get('/', AdminController.renderIndex);

router.get('/flight', AdminController.renderAddFlightForm);
router.get('/user', AdminController.renderUserPage);

module.exports = router;
