const { FlightDAO, CityDAO, RouteDAO } = require('../DB/dao');

exports.searchFlights = async (req, res) => {
  const { from, to, date, passengers } = req.query;

  try {
    const cities = await CityDAO.GetAll();

    const startCityId = parseInt(from);
    const finishCityId = parseInt(to);
    const countTickets = parseInt(passengers) > 0 ? parseInt(passengers) : 1;

    let rawFlights = [];

    if (!isNaN(startCityId) && !isNaN(finishCityId)) {
      rawFlights = await FlightDAO.findAvailable({
        date,
        fromCity: startCityId,
        toCity: finishCityId,
        seatsRequired: countTickets,
      });
      // Преобразуем для вывода
      flights = rawFlights.map(flight => {
        const isReturn = flight.return_flight === true;
        const startCity = flight.Route?.startCity?.name || 'Неизвестно';
        const finishCity = flight.Route?.finishCity?.name || 'Неизвестно';
      
        return {
          flight_id: flight.flight_id,
          start_city: isReturn ? finishCity : startCity,
          finish_city: isReturn ? startCity : finishCity,
          start_time: flight.start_time,
          travel_time: RouteDAO.formatTime(flight.Route?.travel_time) || 'Неизвестно',
          price: flight.price,
          car_capacity: flight.Car?.capacity || 'Неизвестно',
        };
      });
      
    }
    res.render('pages/search', {
      title: 'Поиск',
      styles: ['search-form', 'styles'],
      scripts: ['search-menu'],
      cities,
      flights,
      query: req.query,
      citystart: startCityId,
      cityfinish: finishCityId,
      date,
    });
  } catch (err) {
    console.error('Ошибка при поиске рейсов:', err);
    res.status(500).send('Ошибка при поиске рейсов');
  }
};
