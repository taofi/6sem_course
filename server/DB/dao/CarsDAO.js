const { Cars } = require('../models'); // Импортируем Cars из index.js

class CarsDAO {

 static validation(carData){
  if (!carData || typeof carData.car_number !== 'string' 
    || typeof carData.car_brand !== 'string') {
    throw new Error("Некорректные данные: carNumber car_brand должен быть строкой. ");
  }
  
  const capacity = Number(carData.capacity);
  if (isNaN(capacity)) {
      throw new Error("capacity должно быть числом");
  }
  if (capacity <= 0 ) {
    throw new Error("capacity должно быть больше 0");
}
  carData.capacity = capacity;
  return carData;
 }

  static async Create(carData) {
    try {
      return await Cars.create(CarsDAO.validation(carData));
    } catch (error) {
      console.error('Error creating car:', error);
      throw error;
    }
  }

  static async GetById(carId) {
    try {
      return await Cars.findByPk(carId);
    } catch (error) {
      console.error('Error getting car by ID:', error);
      throw error;
    }
  }

  static async Update(carData) {
    try {
      const carId = Number(carData.car_id);
      console
      if (isNaN(carId)) {
        throw new Error("car_id должно быть числом");
      }
      CarsDAO.validation(carData);
      const car = await Cars.findByPk(carId);
      if (car) {
        car.car_number = carData.car_number;
        car.car_brand = carData.car_brand;
        car.capacity = carData.capacity;
        return await car.save();
      }
      return null;
    } catch (error) {
      console.error('Error updating car:', error);
      throw error;
    }
  }

  static async Delete(carId) {
    try {
      const car = await Cars.findByPk(carId);
      if (car) {
        await car.destroy();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting car:', error);
      throw error;
    }
  }

  static async GetAll() {
    try {
      return await Cars.findAll();
    } catch (error) {
      console.error('Error getting all cars:', error);
      throw error;
    }
  }
}

module.exports = CarsDAO;
