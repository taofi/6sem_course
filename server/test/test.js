const CityDAO = require('../DB/dao/CityDAO');
const RouteDAO = require('../DB/dao/RouteDAO');
const DriverDAO = require('../DB/dao/DriverDAO');
const CarsDAO = require('../DB/dao/CarsDAO');
const FlightDAO = require('../DB/dao/FlightDAO');
const StopsDAO = require('../DB/dao/StopsDAO');
const TicketsDAO = require('../DB/dao/TicketsDAo');
const UsersDAO = require('../DB/dao/UsersDAO');

async function testCityDAO() {
  console.log('Тесты для CityDAO:');
  
  // Создание города
  const newCity = await CityDAO.createCity('Москва');
  console.log('Создан город:', newCity);

  // Получение города
  const city = await CityDAO.getCityById(newCity.city_id);
  console.log('Полученный город:', city);

  // Обновление города
  const updatedCity = await CityDAO.updateCity(newCity.city_id, 'Санкт-Петербург');
  console.log('Обновленный город:', updatedCity);

  // Получение всех городов
  const allCities = await CityDAO.getAllCities();
  console.log('Все города:', allCities);

  // Удаление города
  const deleted = await CityDAO.deleteCity(newCity.city_id);
  console.log('Удален город:', deleted);
}



async function testRouteDAO() {
  console.log('Тесты для RouteDAO:');
  
  // Создание маршрута
  const newRoute = await RouteDAO.createRoute(1, 2, '02:30:00');
  console.log('Создан маршрут:', newRoute);

  // Получение маршрута
  const route = await RouteDAO.getRouteById(newRoute.route_id);
  console.log('Полученный маршрут:', route);

  // Обновление маршрута
  const updatedRoute = await RouteDAO.updateRoute(newRoute.route_id, 1, 3, '03:00:00');
  console.log('Обновленный маршрут:', updatedRoute);

  // Получение всех маршрутов
  const allRoutes = await RouteDAO.getAllRoutes();
  console.log('Все маршруты:', allRoutes);

  // Удаление маршрута
  const deleted = await RouteDAO.deleteRoute(newRoute.route_id);
  console.log('Удален маршрут:', deleted);
}



async function testDriverDAO() {
  console.log('Тесты для DriverDAO:');
  
  // Создание водителя
  const newDriver = await DriverDAO.createDriver('Иван', 'Иванов', '1234567890');
  console.log('Создан водитель:', newDriver);

  // Получение водителя
  const driver = await DriverDAO.getDriverById(newDriver.driver_id);
  console.log('Полученный водитель:', driver);

  // Обновление водителя
  const updatedDriver = await DriverDAO.updateDriver(newDriver.driver_id, 'Петр', 'Петров', '0987654321');
  console.log('Обновленный водитель:', updatedDriver);

  // Получение всех водителей
  const allDrivers = await DriverDAO.getAllDrivers();
  console.log('Все водители:', allDrivers);

  // Удаление водителя
  const deleted = await DriverDAO.deleteDriver(newDriver.driver_id);
  console.log('Удален водитель:', deleted);
}



async function testCarsDAO() {
  console.log('Тесты для CarsDAO:');
  
  // Создание машины
  const newCar = await CarsDAO.createCar('A123BC', 'Toyota', 5);
  console.log('Создана машина:', newCar);

  // Получение машины
  const car = await CarsDAO.getCarById(newCar.car_id);
  console.log('Полученная машина:', car);

  // Обновление машины
  const updatedCar = await CarsDAO.updateCar(newCar.car_id, 'B456CD', 'Honda', 4);
  console.log('Обновленная машина:', updatedCar);

  // Получение всех машин
  const allCars = await CarsDAO.getAllCars();
  console.log('Все машины:', allCars);

  // Удаление машины
  const deleted = await CarsDAO.deleteCar(newCar.car_id);
  console.log('Удалена машина:', deleted);
}



async function testFlightDAO() {
  console.log('Тесты для FlightDAO:');
  
  // Создание рейса
  const newFlight = await FlightDAO.createFlight(1, 1, 1, 1500.00, new Date());
  console.log('Создан рейс:', newFlight);

  // Получение рейса
  const flight = await FlightDAO.getFlightById(newFlight.flight_id);
  console.log('Полученный рейс:', flight);

  // Обновление рейса
  const updatedFlight = await FlightDAO.updateFlight(newFlight.flight_id, 1, 1, 1, 2000.00, new Date());
  console.log('Обновленный рейс:', updatedFlight);

  // Получение всех рейсов
  const allFlights = await FlightDAO.getAllFlights();
  console.log('Все рейсы:', allFlights);

  // Удаление рейса
  const deleted = await FlightDAO.deleteFlight(newFlight.flight_id);
  console.log('Удален рейс:', deleted);
}



async function testStopsDAO() {
  console.log('Тесты для StopsDAO:');
  
  // Создание остановки
  const newStop = await StopsDAO.createStop(1, new Date(), 'Центральный вокзал', 'Москва, ул. Ленина');
  console.log('Создана остановка:', newStop);

  // Получение остановки
  const stop = await StopsDAO.getStopById(newStop.stop_id);
  console.log('Полученная остановка:', stop);

  // Обновление остановки
  const updatedStop = await StopsDAO.updateStop(newStop.stop_id, 1, new Date(), 'Новое название', 'Новый адрес');
  console.log('Обновленная остановка:', updatedStop);

  // Получение всех остановок
  const allStops = await StopsDAO.getAllStops();
  console.log('Все остановки:', allStops);

  // Удаление остановки
  const deleted = await StopsDAO.deleteStop(newStop.stop_id);
  console.log('Удалена остановка:', deleted);
}



async function testUsersDAO() {
  console.log('Тесты для UsersDAO:');
  
  // Создание пользователя
  const newUser = await UsersDAO.createUser('test_user', 'password123', 'user', 'Александр', 'Сидоров', '9876543210');
  console.log('Создан пользователь:', newUser);

  // Получение пользователя
  const user = await UsersDAO.getUserById(newUser.user_id);
  console.log('Полученный пользователь:', user);

  // Обновление пользователя
  const updatedUser = await UsersDAO.updateUser(newUser.user_id, 'test_user_updated', 'new_password', 'admin', 'Александр', 'Сидоров', '9876543210');
  console.log('Обновленный пользователь:', updatedUser);

  // Получение всех пользователей
  const allUsers = await UsersDAO.getAllUsers();
  console.log('Все пользователи:', allUsers);

  // Удаление пользователя
  const deleted = await UsersDAO.deleteUser(newUser.user_id);
  console.log('Удален пользователь:', deleted);
}



async function testTicketsDAO() {
  console.log('Тесты для TicketsDAO:');
  
  // Создание билета
  const newTicket = await TicketsDAO.createTicket(1, 1, 1, 2);
  console.log('Создан билет:', newTicket);

  // Получение билета
  const ticket = await TicketsDAO.getTicketById(newTicket.ticket_id);
  console.log('Полученный билет:', ticket);

  // Обновление билета
  const updatedTicket = await TicketsDAO.updateTicket(newTicket.ticket_id, 1, 1, 1, 3);
  console.log('Обновленный билет:', updatedTicket);

  // Получение всех билетов
  const allTickets = await TicketsDAO.getAllTickets();
  console.log('Все билеты:', allTickets);

  // Удаление билета
  const deleted = await TicketsDAO.deleteTicket(newTicket.ticket_id);
  console.log('Удален билет:', deleted);
}

//testCityDAO();
//testUsersDAO();
//testStopsDAO();
//testFlightDAO();
//testCarsDAO();
//testDriverDAO();
//testTicketsDAO();
//testRouteDAO();
