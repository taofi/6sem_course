const { City, Route } = require('../models'); // Импортируем City из index.js

class CityDAO {
  static validation(cityData)
  {
    if (!cityData || typeof cityData.name !== 'string') {
      throw new Error("Некорректные данные: Name должен быть строкой.");
    }
    return cityData;
  }
  static async Create(cityData) {
    try {
      return await City.create(CityDAO.validation(cityData));
    } catch (error) {
      console.error('Error creating city:', error);
      throw error;
    }
  }

  static async GetById(cityId) {
    try {
      return await City.findByPk(cityId);
    } catch (error) {
      console.error('Error getting city by ID:', error);
      throw error;
    }
  }

  static async Update(cityData) {
    try {
      const cityId = Number(cityData.city_id);
      if (isNaN(cityId)) {
        throw new Error("city_id должно быть числом");
      }
      CityDAO.validation(cityData);
      const city = await City.findByPk(cityId);
      if (city) {
        city.name = cityData.name;
        return await city.save();
      }
      return null;
    } catch (error) {
      console.error('Error updating city:', error);
      throw error;
    }
  }

  static async Delete(cityId) {
    try {
      const city = await City.findByPk(cityId);
      if (city) {
        await city.destroy();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting city:', error);
      throw error;
    }
  }

  static async GetAll() {
    try {
      return await City.findAll();
    } catch (error) {
      console.error('Error getting all cities:', error);
      throw error;
    }
  }

  
  static async getRoutesFromCity(fromCity) {
    try {
      const city = await City.findOne({
        where: { name: fromCity },
        attributes: ['city_id'],
      });
  
      if (!city) {
        throw new Error(`Город с названием ${fromCity} не найден.`);
      }
  
      // Все маршруты, где fromCity — начальный город
      const routesFrom = await Route.findAll({
        where: { start_city_id: city.city_id },
        include: [
          {
            model: City,
            as: 'finishCity',
            attributes: ['name'],
          },
        ],
        attributes: ['route_id', 'finish_city_id'],
      });
  
      // Все маршруты, где fromCity — конечный город
      const routesTo = await Route.findAll({
        where: { finish_city_id: city.city_id },
        include: [
          {
            model: City,
            as: 'startCity',
            attributes: ['name'],
          },
        ],
        attributes: ['route_id', 'start_city_id'],
      });
  
      // Собираем уникальные города
      const uniqueCitiesMap = new Map();
  
      routesFrom.forEach(route => {
        if (route.finishCity) {
          uniqueCitiesMap.set(route.finishCity.name, {
            to: route.finishCity.name,
            routeId: route.route_id,
          });
        }
      });
  
      routesTo.forEach(route => {
        if (route.startCity && !uniqueCitiesMap.has(route.startCity.name)) {
          uniqueCitiesMap.set(route.startCity.name, {
            to: route.startCity.name,
            routeId: route.route_id,
          });
        }
      });
  
      return Array.from(uniqueCitiesMap.values());
  
    } catch (err) {
      console.error('Ошибка при получении маршрутов для города:', err);
      throw new Error('Ошибка получения маршрутов');
    }
  }
  
}

module.exports = CityDAO;
