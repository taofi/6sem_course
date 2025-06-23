const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController");
const {isAuthenticated} = require('../middleware/auth');

router.get('/', userController.profile);
router.get('/generateCode', userController.generateCode);


router.get('/edit', userController.showEditProfile);
router.post('/update', userController.updateProfile);

module.exports = router;