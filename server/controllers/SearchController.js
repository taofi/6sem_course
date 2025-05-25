const {FlightDao, CityDAO} = require('../DB/dao');

exports.searchFlights = async (req, res) => {
  const { citystart, cityfinish } = req.params;
  const { date, passengers } = req.query;

  try {
    const cities = await CityDAO.GetAll();

    const startCity = citystart || null;
    const finishCity = cityfinish || null;
    const countTickets = parseInt(passengers) > 0 ? parseInt(passengers) : 1;

    let flights = [];
    if (startCity && finishCity) {
      flights = await FlightDao.getAvailableFlights({
        startCity,
        finishCity,
        countTickets,
        date: date || null,
      });
    }


    res.render('pages/search', {
        title: 'Поиск',
        styles: ['search-form', 'styles'],
        scripts: ['search-menu'],
        cities,
        flights,
        query: req.query,
        citystart: startCity,
        cityfinish: finishCity,
        date,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при поиске рейсов');
  }
};
