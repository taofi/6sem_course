const { Users, Tickets } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

class UsersDAO {
  static validate(userData, isUpdate = false) {
    if (!userData) throw new Error("Данные отсутствуют.");

    const fields = [
      { key: 'login', max: 50 },
      { key: 'pass', max: 100 },
      { key: 'name', max: 50 },
      { key: 'last_name', max: 50 },
      { key: 'user_number', max: 20 },
    ];

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

    return userData;
  }

  static async Create(userData) {
    try {
      const validated = UsersDAO.validate(userData);
      const existing = await Users.findOne({ where: { login: validated.login } });
      if (existing) throw new Error('Логин уже используется');
      return await Users.create(validated);
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
      const validated = UsersDAO.validate(userData, true);
      const user = await Users.findByPk(validated.user_id);
      if (!user) throw new Error('Пользователь не найден');

      const duplicateLogin = await Users.findOne({
        where: {
          login: validated.login,
          user_id: { [Op.ne]: validated.user_id }
        }
      });
      if (duplicateLogin) throw new Error('Логин уже занят другим пользователем');

      Object.assign(user, validated);
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
  
  static async Register(userData) {
    try {
      userData.role = 'user';
      UsersDAO.validate(userData);
      
      const existing = await Users.findOne({ where: { login: userData.login } });
      if (existing) {
        return { error: 'Логин уже используется' };
      }
  
      const hashedPassword = await bcrypt.hash(userData.pass, 10);
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
}    
module.exports = UsersDAO;
