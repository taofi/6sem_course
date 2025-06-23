const express = require('express');
const router = express.Router();
const apiRoutes = require('./apiRoutes');
const webRoutes = require('./webRoutes');
const searchRoutes = require('./searchRoutes');
const ticketRoutes = require('./ticketRoutes');

const adminRoutes = require('./adminRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

const {isAuthenticated} = require('../middleware/auth');
const requireRole  = require('../middleware/requireRole');



// Основные маршруты
router.use('/', webRoutes);
router.use('/', authRoutes);

router.use('/api', apiRoutes);

router.use('/search', searchRoutes);
router.use('/profile', isAuthenticated, userRoutes);
router.use('/ticket', isAuthenticated, ticketRoutes);

router.use('/admin', adminRoutes);

// 404 обработчик
router.use((req, res) => {
  res.status(404).render('pages/404', {
    title: 'Страница не найдена'
  });
});

module.exports = router;