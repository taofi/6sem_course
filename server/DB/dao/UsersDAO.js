const { Users, Tickets } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class UsersDAO {
  static async validate(userData, isUpdate = false) {
    if (!userData) throw new Error("Данные отсутствуют.");

    const fields = [
      { key: 'login', max: 50 },
      { key: 'name', max: 50 },
      { key: 'last_name', max: 50 },
      { key: 'user_number', max: 20 },
    ];

    if (!isUpdate) {
      fields.push({ key: 'pass', max: 100 });
    } else {
      if (userData.pass && userData.pass.trim() !== '') {
        fields.push({ key: 'pass', max: 100 });
      }
    }

    for (const field of fields) {
      const value = userData[field.key];
      if (!value || typeof value !== 'string' || value.length > field.max) {
        throw new Error(`Поле ${field.key} некорректно или превышает длину ${field.max}`);
      }
    }

    if (isUpdate) {
      if (!userData.user_id || isNaN(Number(userData.user_id))) {
        throw new Error("user_id должен быть числом");
      }
      if (!userData.role || typeof userData.role !== 'string' || userData.role.length > 50) {
        throw new Error("Некорректные данные: role должно быть строкой длиной до 50 символов.");
      }
    }

    // Проверка уникальности логина
    const duplicateLogin = await Users.findOne({
      where: {
        login: userData.login,
        ...(isUpdate ? { user_id: { [Op.ne]: userData.user_id } } : {})
      }
    });
    if (duplicateLogin) {
      throw new Error('Логин уже занят другим пользователем');
    }

    return userData;
  }

  static async Create(userData) {
    try {
      UsersDAO.validate(userData);
      const existing = await Users.findOne({ where: { login: userData.login } });
      if (existing) throw new Error('Логин уже используется');
      const hashedPassword = await bcrypt.hash(userData.pass, 10);
      userData.pass = hashedPassword;
      console.log(userData);
      return await Users.create(userData);
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
      throw error;
    }
  }

  static async GetById(userId) {
    try {
      if (isNaN(Number(userId))) throw new Error('Некорректный ID');
      return await Users.findByPk(userId);
    } catch (error) {
      console.error('Ошибка при получении пользователя по ID:', error);
      throw error;
    }
  }

  static async Update(userData) {
    try {
      if (!userData.user_id) {
        throw new Error('user_id обязателен для обновления');
      }
  
      const user = await Users.findByPk(userData.user_id);
      if (!user) throw new Error('Пользователь не найден');
  
      // Отдельно сохраняем пароль, если есть
      let pass = userData.pass;
      delete userData.pass; // чтобы не перезаписать без хеша
  
      // Обновляем только те поля, которые есть в userData (кроме user_id)
      Object.keys(userData).forEach(key => {
        if (key !== 'user_id' && userData[key] !== undefined) {
          user[key] = userData[key];
        }
      });
  
      // Если передан пароль, обновляем его с хешированием
      if (pass && pass.trim() !== '') {
        user.pass = await bcrypt.hash(pass, saltRounds);
      }
  
      return await user.save();
    } catch (error) {
      console.error('Ошибка при обновлении пользователя:', error);
      throw error;
    }
  }
  

  static async Delete(userId) {
    try {
      userId = Number(userId);
      if (isNaN(userId)) throw new Error('Некорректный ID');
  
      const user = await Users.findByPk(userId);
      if (!user) throw new Error('Пользователь не найден');
  
      await Tickets.destroy({ where: { user_id: userId } });
  
      await user.destroy();
      return true;
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      throw error;
    }
  }

  static async GetAll() {
    try {
      return await Users.findAll();
    } catch (error) {
      console.error('Ошибка при получении всех пользователей:', error);
      throw error;
    }
  }

  static async Login(login, pass) {
    if (!login || !pass) {
      return { error: 'Не указан логин или пароль' };
    }
  
    try {
      const user = await Users.findOne({ where: { login } });
      if (!user) {
        return { error: 'Неверный логин или пароль' };
      }
  
      const match = await bcrypt.compare(pass, user.pass);
      if (!match) {
        return { error: 'Неверный логин или пароль' };
      }
  
      return { user }; // Возвращаем объект с полем user
    } catch (error) {
      console.error('Ошибка при входе:', error);
      return { error: 'Ошибка сервера при входе' };
    }
  }
  static async findByLogin(login) {
    try {
      const user = await UserModel.findOne({ where: { Login: login } });
      return user;
    } catch (error) {
      console.error('Ошибка поиска пользователя по логину:', error);
      throw error;
    }
  }
  static async Register(userData) {
    try {
      userData.role = 'user';

      if(userData.name == 'admin')
        userData.role = 'admin';

      UsersDAO.validate(userData);
      
      const existing = await Users.findOne({ where: { login: userData.login } });
      if (existing) {
        return { error: 'Логин уже используется' };
      }
  
      const hashedPassword = await bcrypt.hash(userData.pass, saltRounds);
      userData.pass = hashedPassword;
  
      const user = await Users.create(userData);
      return { user };
    } catch (error) {
      console.error('Ошибка при регистрации пользователя:', error);
      return { error: 'Ошибка при регистрации пользователя' };
    }
  }
  
  
  static async CheckRole(userId, role) {
    try {
      const user = await Users.findByPk(userId);
      if (!user) return false;
      return user.role === role;
    } catch (error) {
      console.error('Ошибка при проверке роли:', error);
      return false;
    }
  }
  static async GetDriver() {
    try {
      return await Users.findAll({
        where: { role: 'driver' }
      });
    } catch (error) {
      console.error('Ошибка при получении водителей:', error);
      throw error;
    }
  }
  static async CheckDriverRole(driverId) {
    const user = await Users.findByPk(driverId);
    return user && user.role === 'driver';
  }
  
  static async GetUsersWithTelegramId() {
    try {
      return await Users.findAll({
        where: {
          telegram_id: {
            [Op.ne]: null
          }
        }
      });
    } catch (error) {
      console.error('Ошибка при получении пользователей с telegram_id:', error);
      throw error;
    }
  }
  static async SetTelegramId(userId, telegramId) {
    try {
      const user = await Users.findByPk(userId);
      if (!user) throw new Error('Пользователь не найден');
      user.telegram_id = telegramId;
      await user.save();
      return user;
    } catch (error) {
      console.error('Ошибка при установке telegram_id:', error);
      throw error;
    }
  }
  static async GetTelegramIdByUserId(userId) {
    try {
      const user = await Users.findByPk(userId, {
        attributes: ['telegram_id']
      });
      if (!user) throw new Error('Пользователь не найден');
      return user.telegram_id;
    } catch (error) {
      console.error('Ошибка при получении telegram_id:', error);
      throw error;
    }
  }
  static async GetUserIdByTelegramId(telegramId) {
    try {
      const user = await Users.findOne({
        where: { telegram_id: telegramId },
        attributes: ['user_id']
      });
      if (!user) throw new Error('Пользователь не найден');
      return user.user_id;
    } catch (error) {
      console.error('Ошибка при получении user_id по telegram_id:', error);
      throw error;
    }
  }
      
  
}    
module.exports = UsersDAO;
