const { Stops, City } = require('../models'); // Импортируем Stops из index.js
const sequelize = require('../../config/database');

class StopsDAO {

  static validation(stopData) {
    if (!stopData) {
      throw new Error("Данные отсутствуют.");
    }

    stopData.city_id = Number(stopData.city_id);
    if (isNaN(stopData.city_id) || stopData.city_id <= 0) {
      throw new Error("Некорректные данные: city_id должно быть положительным числом.");
    }

    const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
    if (typeof stopData.time !== 'string' || !timeRegex.test(stopData.time)) {
      throw new Error("Некорректный формат time. Ожидаемый формат: 'HH:MI:SS'.");
    }

    if (typeof stopData.name !== 'string' || stopData.name.length > 100) {
      throw new Error("Некорректные данные: name должно быть строкой длиной до 100 символов.");
    }

    if (typeof stopData.address !== 'string' || stopData.address.length > 200) {
      throw new Error("Некорректные данные: address должно быть строкой длиной до 200 символов.");
    }

    // Проверка широты: число от -90 до 90
    const lat = parseFloat(stopData.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      throw new Error("Некорректные данные: latitude должно быть числом от -90 до 90.");
    }

    // Проверка долготы: число от -180 до 180
    const lon = parseFloat(stopData.longitude);
    if (isNaN(lon) || lon < -180 || lon > 180) {
      throw new Error("Некорректные данные: longitude должно быть числом от -180 до 180.");
    }

    // Присваиваем преобразованные значения обратно
    stopData.latitude = lat;
    stopData.longitude = lon;

    return stopData;
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



  static async Create(stopData) {
    try {
      StopsDAO.validation(stopData);
      const intervalTime = `INTERVAL '${stopData.time}' HOUR TO SECOND`;
  
      return await Stops.sequelize.query(
        `INSERT INTO STOPS (CITY_ID, TIME, NAME, ADDRESS, LATITUDE, LONGITUDE)
         VALUES (:city_id, ${intervalTime}, :name, :address, :latitude, :longitude)`,
        {
          replacements: {
            city_id: stopData.city_id,
            name: stopData.name,
            address: stopData.address,
            latitude: stopData.latitude,
            longitude: stopData.longitude
          }
        }
      );
    } catch (error) {
      console.error('Error creating stop:', error);
      throw error;
    }
  }
  
  static async Update(stopData) {
    try {
      const stopId = Number(stopData.stop_id);
      if (isNaN(stopId)) {
        throw new Error("stop_id должно быть числом");
      }
  
      StopsDAO.validation(stopData);
      const intervalTime = `INTERVAL '${stopData.time}' HOUR TO SECOND`;
  
      return await Stops.sequelize.query(
        `UPDATE STOPS SET
           CITY_ID = :city_id,
           TIME = ${intervalTime},
           NAME = :name,
           ADDRESS = :address,
           LATITUDE = :latitude,
           LONGITUDE = :longitude
         WHERE STOP_ID = :stop_id`,
        {
          replacements: {
            city_id: stopData.city_id,
            name: stopData.name,
            address: stopData.address,
            latitude: stopData.latitude,
            longitude: stopData.longitude,
            stop_id: stopId
          }
        }
      );
    } catch (error) {
      console.error('Error updating stop:', error);
      throw error;
    }
  }
  
  static async Delete(stopId) {
    try {
      const stop = await Stops.findByPk(stopId);
      if (stop) {
        await stop.destroy();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting stop:', error);
      throw error;
    }
  }

  static async GetAll() {
    try {
      return await Stops.findAll();
    } catch (error) {
      console.error('Error getting all stops:', error);
      throw error;
    }
  }

  static async GetByCityId(cityId) {
    if (isNaN(cityId) || cityId <= 0) {
      throw new Error("Некорректный city_id");
    }
    try {
      const stops = await Stops.findAll({
        where: { city_id: cityId },
        raw: true,
      });
      return stops.map(stop => ({
        stop_id: stop.stop_id,
        city_id: stop.city_id,
        name: stop.name,
        address: stop.address,
        time: StopsDAO.formatTime(stop.time),
        longitude: stop.longitude,
        latitude: stop.latitude,
      }));
    } catch (error) {
      console.error('Error getting stops by city id:', error);
      throw error;
    }
  }


  static async GetFormated() {
    const stops = await Stops.findAll({
      include: {
        model: City,
        attributes: ['name'],
      },
      raw: true,
      nest: true
    });

    return stops.map(stop => ({
      stop_id: stop.stop_id,
      city_name: stop.City.name,
      name: stop.name,
      address: stop.address,
      latitude: stop.latitude,
      longitude: stop.longitude,

      time: StopsDAO.formatTime(stop.time)
    }));
  }
}

module.exports = StopsDAO;
