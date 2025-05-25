const { Route, City } = require('../models'); 

class RouteDAO {
  static validation(routeData)
  {
    if (!routeData) {
      throw new Error("Некорректные данные: объект routeData отсутствует.");
  }

  const startCityId = Number(routeData.start_city_id);
  if (isNaN(startCityId)) {
      throw new Error("start_city_id должно быть числом");
  }
  routeData.start_city_id = startCityId;
  const finishCityId = Number(routeData.finish_city_id);
  if (isNaN(finishCityId)) {
      throw new Error("finish_city_id должно быть числом");
  }
  routeData.finish_city_id = finishCityId;
  if (typeof routeData.travel_time !== 'string') {
      throw new Error("travel_time должно быть строкой.");
  }

  // Регулярное выражение для формата 'D HH:MI:SS'
  const intervalRegex = /^\d+\s\d{2}:\d{2}:\d{2}$/;
  if (!intervalRegex.test(routeData.travel_time)) {
      throw new Error("travel_time должно быть в формате 'D HH:MI:SS', например '2 12:30:45'");
  }
    return routeData;
  }
  
  static formatTime(interval) {
    let timeString = '00:00:00';
  
    if (interval && typeof interval === 'object') {
      const hh = String(interval.hours || 0).padStart(2, '0');
      const mm = String(interval.minutes || 0).padStart(2, '0');
      const ss = String(interval.seconds || 0).padStart(2, '0');
      timeString = `${hh}:${mm}:${ss}`;
    }
  
    return timeString;
  }

  static async Create(routeData) {
    try {    
     return await Route.create(RouteDAO.validation(routeData));
  } catch (error) {
      console.error('Error creating route:', error);
      throw error;
  }
  }

  static async GetByID(routeId) {
    try {
      return await Route.findByPk(routeId);
    } catch (error) {
      console.error('Error getting route by ID:', error);
      throw error;
    }
  }

  static async getAllWithCityNames() {
    try {
      const routes = await Route.findAll({
        include: [
          { model: City, as: 'startCity', attributes: ['name'] },
          { model: City, as: 'finishCity', attributes: ['name'] },
        ],
        attributes: ['route_id', 'travel_time'],
        raw: true,
      });

      return routes.map(route => {
        const travelTime = route.travel_time;
        const days = travelTime.days || 0;
        const hours = travelTime.hours || 0;
        const minutes = travelTime.minutes || 0;
        const dayPart = days > 0 ? `${days} д ` : '';
        const formattedTime = `${dayPart}${hours} ч ${minutes} мин`;
        return {
          route_id: route.route_id,
          startCity: route['startCity.name'],
          finishCity: route['finishCity.name'],
          time: formattedTime,
        };
      });
    } catch (err) {
      console.error('Ошибка в RouteDAO:', err);
      throw err;
    }
  }

  static async Update(routeData) {
    try {
      const routeId = Number(routeData.route_id);
      if (isNaN(routeId)) {
        throw new Error("route_id должно быть числом");
      }
      RouteDAO.validation(routeData);
      const route = await Route.findByPk(routeId);
      if (route) {
        route.start_city_id = routeData.start_city_id;
        route.finish_city_id = routeData.finish_city_id;
        route.travel_time = routeData.travel_time;
        return await route.save();
      }
      return null;
    } catch (error) {
      console.error('Error updating route:', error);
      throw error;
    }
  }

  static async Delete(routeId) {
    try {
      const route = await Route.findByPk(routeId);
      if (route) {
        await route.destroy();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting route:', error);
      throw error;
    }
  }

  static async GetAll() {
    try {
      return await Route.findAll();
    } catch (error) {
      console.error('Error getting all routes:', error);
      throw error;
    }
  }

  static async getRoutesFromCity(fromCity) {
    try {
      // Преобразуем название города в его ID (можно это делать через CityDAO или отдельный запрос)
      const city = await City.findOne({
        where: { name: fromCity },
        attributes: ['city_id']  // Предполагаем, что в таблице City есть поле city_id
      });

      if (!city) {
        throw new Error(`Город с названием ${fromCity} не найден в базе данных.`);
      }

      const fromCityId = city.city_id;

      // Запрос к базе данных для получения маршрутов, где start_city_id равен найденному ID
      const routes = await Route.findAll({
        where: { start_city_id: fromCityId },  // Фильтруем по ID города отправления
        include: [
          { model: City, as: 'finishCity', attributes: ['name'] },  // Включаем информацию о городе назначения
        ],
        attributes: ['route_id', 'finish_city_id', 'travel_time'],
      });

      // Маппируем маршруты на города назначения
      const toCities = routes.map(route => ({
        to: route.finishCity.name,  // Имя города назначения
        routeId: route.route_id,  // ID маршрута
      }));

      return toCities;
    } catch (err) {
      console.error('Ошибка при получении маршрутов из базы данных:', err);
      throw new Error('Ошибка получения маршрутов');
    }
  }
}

module.exports = RouteDAO;
