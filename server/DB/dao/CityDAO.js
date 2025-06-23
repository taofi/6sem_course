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

  static async findCityIdByName(name) {
    const city = await City.findOne({
      where: {
        name: name
      },
      attributes: ['id']
    });
    return city ? city.id : null;
  }
  
  static async getRoutesFromCity(fromCity) {
    try {
      const cityId = parseInt(fromCity);
  
      const routesFrom = await Route.findAll({
        where: { start_city_id: cityId },
        include: [
          {
            model: City,
            as: 'finishCity',
            attributes: ['city_id', 'name'],
          },
        ],
        attributes: ['route_id', 'finish_city_id'],
      });
  
      const routesTo = await Route.findAll({
        where: { finish_city_id: cityId },
        include: [
          {
            model: City,
            as: 'startCity',
            attributes: ['city_id', 'name'],
          },
        ],
        attributes: ['route_id', 'start_city_id'],
      });
  
      const uniqueCitiesMap = new Map();
  
      routesFrom.forEach(route => {
        if (route.finishCity) {
          uniqueCitiesMap.set(route.finishCity.city_id, {
            id: route.finishCity.city_id,
            name: route.finishCity.name,
            routeId: route.route_id,
          });
        }
      });
  
      routesTo.forEach(route => {
        if (route.startCity && !uniqueCitiesMap.has(route.startCity.city_id)) {
          uniqueCitiesMap.set(route.startCity.city_id, {
            id: route.startCity.city_id,
            name: route.startCity.name,
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
