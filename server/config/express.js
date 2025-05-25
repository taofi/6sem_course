const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const passport = require('./passport');

module.exports = {
  initializeExpress: (app) => {
    // Настройка EJS
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));
    app.use(expressLayouts);
    app.set('layout', 'layouts/main');
    
    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, '../public')));
    
    // Сессии (должно быть перед passport)
    app.use(session({
      secret: process.env.SESSION_SECRET || 'secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 день
      }
    }));
    
    // Инициализация Passport (правильный порядок)
    app.use(passport.initialize());
    app.use(passport.session());
    
    // Middleware для добавления user в locals (после passport)
    app.use((req, res, next) => {
      res.locals.user = req.user || null; 
      next();
    });
  
    // Глобальные переменные для шаблонов
    app.use((req, res, next) => {
      res.locals.currentYear = new Date().getFullYear();
      res.locals.siteName = process.env.SITE_NAME || 'Мой сайт';
      next();
    });
  }
};