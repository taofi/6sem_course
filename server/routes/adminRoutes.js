const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const requireRole = require('../middleware/requireRole');
const {isAuthenticated} = require('../middleware/auth');


// Все маршруты защищены авторизацией
router.use(isAuthenticated);

// Доступны и admin, и operator
router.get('/operator', requireRole(['admin', 'operator']), AdminController.renderOperatorPage);
router.get('/operator/user', requireRole(['admin', 'operator']), AdminController.renderOperatorUserPage);

router.get('/orderTicket/:id', requireRole(['admin', 'operator']), AdminController.orderTicketPage);
router.post('/orderTicket/:id', requireRole(['admin', 'operator']), AdminController.orderTicketController);

router.get('/tickets/edit/:id', requireRole(['admin', 'operator']), AdminController.editTicketPage);
router.put('/tickets/edit/:id', requireRole(['admin', 'operator']), AdminController.editTicket);

router.get('/tickets/flight/:flightId', requireRole(['admin', 'operator']), AdminController.ticketsByFlightPage);
router.get('/user/:userId/tickets', requireRole(['admin', 'operator']), AdminController.renderUserTicketsPage);

// Только для admin
router.get('/', requireRole(['admin']), AdminController.renderIndex);
router.get('/flight', requireRole(['admin']), AdminController.renderAddFlightForm);
router.get('/city', requireRole(['admin']), AdminController.renderCityPage);
router.get('/cars', requireRole(['admin']), AdminController.renderCarsPage);
router.get('/route', requireRole(['admin']), AdminController.renderRoutePage);
router.get('/stops', requireRole(['admin']), AdminController.renderStopsPage);
router.get('/user', requireRole(['admin']), AdminController.renderUserPage);

module.exports = router;
