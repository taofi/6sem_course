const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');


router.get('/', AdminController.renderIndex);

router.get('/flight', AdminController.renderAddFlightForm);
router.get('/city', AdminController.renderCityPage);
router.get('/cars', AdminController.renderCarsPage);
router.get('/driver', AdminController.renderDriverPage);
router.get('/route', AdminController.renderRoutePage);
router.get('/stops', AdminController.renderStopsPage);
router.get('/user', AdminController.renderUserPage);

module.exports = router;
