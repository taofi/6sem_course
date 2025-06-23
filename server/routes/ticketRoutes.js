const express = require('express');
const router = express.Router();
const ticketController = require("../controllers/ticketController");

router.get('/order/:id', ticketController.orderTicketPage);
router.post('/order/:id', ticketController.orderTicketController);
router.delete('/delete', ticketController.deleteTicket);

router.get('/edit/:id', ticketController.editTicketPage);
router.put('/edit/:id', ticketController.editTicket);


module.exports = router;