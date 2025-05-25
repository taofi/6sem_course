const { Stops, City } = require('../models'); // Импортируем Stops из index.js
const sequelize = require('../../config/database');

class StopsDAO {

  static validation(stopData)
  {
    if (!stopData) {
      throw new Error("Данные отсутствуют.");
  }
  
  // Преобразуем city_id в число и проверяем его
  stopData.city_id = Number(stopData.city_id);
  if (isNaN(stopData.city_id) || stopData.city_id <= 0) {
      throw new Error("Некорректные данные: city_id должно быть положительным числом.");
  }

  // Проверяем формат времени (HH:MI:SS)
  const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
  if (typeof stopData.time !== 'string' || !timeRegex.test(stopData.time)) {
      throw new Error("Некорректный формат time. Ожидаемый формат: 'HH:MI:SS'.");
  }

  // Создаем интервал для вставки в базу

  if (typeof stopData.name !== 'string' || stopData.name.length > 100) {
      throw new Error("Некорректные данные: name должно быть строкой длиной до 100 символов.");
  }

  if (typeof stopData.address !== 'string' || stopData.address.length > 200) {
      throw new Error("Некорректные данные: address должно быть строкой длиной до 200 символов.");
  }
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

        // Используем обычный SQL-запрос для вставки с интервалом
        return await Stops.sequelize.query(
            `INSERT INTO STOPS (CITY_ID, TIME, NAME, ADDRESS) VALUES (:city_id, ${intervalTime}, :name, :address)`,
            {
                replacements: {
                    city_id: stopData.city_id,
                    name: stopData.name,
                    address: stopData.address
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

        // Используем SQL-запрос для обновления данных
        return await Stops.sequelize.query(
            `UPDATE STOPS SET CITY_ID = :city_id, TIME = ${intervalTime}, NAME = :name, ADDRESS = :address WHERE STOP_ID = :stop_id`,
            {
                replacements: {
                    city_id: stopData.city_id,
                    name: stopData.name,
                    address: stopData.address,
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
      time: StopsDAO.formatTime(stop.time)
    }));
  }
}

module.exports = StopsDAO;
