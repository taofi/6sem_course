const { UsersDAO, TicketsDAO, RouteDAO, FlightDAO } = require("../DB/dao");
const codeStore = require('../DB/codeStore');
const crypto = require('crypto');




module.exports = {


    generateCode: (req, res) => {
        const user = req.user;
        if (!user) return res.status(401).send('Не авторизован');

        const code = crypto.randomBytes(3).toString('hex');
        req.session.telegramCode = code;

        codeStore.addCode(user.user_id, code);

        res.json({ success: true, code: code });
    },

    profile: async (req, res) => {
        try {
            const user = req.user;

            if (!user) {
                return res.status(401).send('Пользователь не авторизован');
            }

            // Получаем билеты для пользователя (включая водителя)
            const ticketsRaw = await TicketsDAO.GetByUserIdWithDetails(user.user_id);
            const tickets = ticketsRaw.map(ticket => {
                const travel_time = RouteDAO.formatTime(ticket.travel_time);
                const formattedStartTime = TicketsDAO.getAdjustedTime(ticket.start_time, ticket.stopTime);
                const totalPrice = (ticket.price || 0) * (ticket.count || 1);

                return {
                    ...ticket,
                    start_time: formattedStartTime,
                    price: totalPrice,
                    travel_time: travel_time,
                };
            });

            let flights = [];

            if (user.role === 'driver') {
                const rawFlights = await FlightDAO.getFlightsByDriverId(user.user_id);

                flights = rawFlights.map(flight => {
                    const travel_time = RouteDAO.formatTime(flight.travel_time);

                    return {
                        ...flight,
                        travel_time
                    };
                });
            }


            res.render('pages/profile', {
                title: 'Профиль',
                styles: ['styles', 'tables'],
                scripts: [],
                user,
                tickets,
                flights,
                error: null
            });
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
            res.render('pages/profile', {
                title: 'Профиль',
                styles: ['styles'],
                scripts: [],
                user: req.user,
                tickets: [],
                flights: [],
                error: error.message
            });
        }
    },


    // Контроллер для отображения страницы редактирования профиля
    showEditProfile: async (req, res) => {
        try {
            const user = req.user; // Пользователь из сессии Passport
            res.render('pages/users/profile-edit', {
                title: 'Редактирование профиля',
                styles: ['styles'],
                scripts: [],
                user,
                errors: null,
                success: null
            });
        } catch (error) {
            console.error('Ошибка загрузки страницы редактирования профиля:', error);
            res.status(500).send('Ошибка сервера');
        }
    },

    // Контроллер для обработки обновления профиля
    updateProfile: async (req, res) => {
        try {
            const userId = req.user.user_id;
            const {
                login,
                name,
                last_name,
                user_number,
                password
            } = req.body;

            if (req.user.user_id !== userId) {
                return res.status(403).send('Доступ запрещён');
            }

            const errors = [];
            if (!login) errors.push('Логин обязателен');
            if (!name) errors.push('Имя обязательно');
            if (!last_name) errors.push('Фамилия обязательна');
            if (!user_number) errors.push('Номер телефона обязателен');

            if (errors.length > 0) {
                return res.render('pages/profile-edit', {
                    title: 'Редактирование профиля',
                    user: req.body,
                    errors,
                    success: null
                });
            }
            console.log({
                user_id: userId,
                login,
                name,
                last_name,
                user_number,
                pass: password,
                role: req.user.role
            });
            const updatedUser = await UsersDAO.Update({
                user_id: userId,
                login,
                name,
                last_name,
                user_number,
                pass: password,
                role: req.user.role
            });

            // После успешного обновления — редирект на профиль
            return res.redirect('/profile');

        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
            res.render('pages/users/profile-edit', {
                title: 'Редактирование профиля',
                user: req.body,
                errors: [error.message || 'Ошибка сервера'],
                success: null
            });
        }
    }

};
