const express = require('express');
const router = express.Router();
const apiMainController = require('../controllers/apiMainController');
const apiController = require('../controllers/apiController');


router.get('/cities', apiController.getCities);  // Получить все города
router.get('/routes-from-city', apiController.getRoutesFromCity);  // Получить маршруты для города "Откуда"



// Универсальные CRUD маршруты
router.get('/:table', apiMainController.getAll);
router.get('/:table/:id', apiMainController.getById);
router.post('/:table', apiMainController.create);
router.put('/:table', apiMainController.update);
router.delete('/:table/', apiMainController.delete);


module.exports = router;