const { Driver } = require('../models'); // Импортируем Driver из index.js

class DriverDAO {

  static validation(driverData)
  {
    if (!driverData || typeof driverData.name !== 'string' 
      || typeof driverData.last_name !== 'string' 
      || typeof driverData.phone_number !== 'string') {
      throw new Error("Некорректные данные: Name, Last_name и Phone_Number должны быть строками.");
    }
    return driverData;
  }
  static async Create(driverData) {
    try {
      
    return await Driver.create(DriverDAO.validation(driverData));

    } catch (error) {
      console.error('Error creating driver:', error);
      throw error;
    }
  }

  static async GetById(driverId) {
    try {
      return await Driver.findByPk(driverId);
    } catch (error) {
      console.error('Error getting driver by ID:', error);
      throw error;
    }
  }

  static async Update(driverData) {
    try {
      const driverId = Number(driverData.driver_id);
      if (isNaN(driverId)) {
        throw new Error("driver_id должно быть числом");
      }
      console.log(driverData);
      DriverDAO.validation(driverData);
      const driver = await Driver.findByPk(driverId);
      if (driver) {
        driver.name = driverData.name;
        driver.last_name = driverData.lastName;
        driver.phone_number = driverData.phoneNumber;
        return await driver.save();
      }
      return null;
    } catch (error) {
      console.error('Error updating driver:', error);
      throw error;
    }
  }

  static async Delete(driverId) {
    try {
      const driver = await Driver.findByPk(driverId);
      if (driver) {
        await driver.destroy();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting driver:', error);
      throw error;
    }
  }

  static async GetAll() {
    try {
      return await Driver.findAll();
    } catch (error) {
      console.error('Error getting all drivers:', error);
      throw error;
    }
  }
}

module.exports = DriverDAO;
