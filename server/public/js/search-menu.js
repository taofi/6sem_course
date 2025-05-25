function updateToCities(fromCity) {
    fetch(`api/routes-from-city?fromCity=${fromCity}`)
      .then(response => response.json())
      .then(data => {
        const toSelect = document.getElementById('to');
        toSelect.innerHTML = '';

        if (data.toCities) {
          data.toCities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            toSelect.appendChild(option);
          });
        }
      })
      .catch(err => {
        console.error('Ошибка при загрузке городов для "Куда":', err);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const fromSelect = document.getElementById('from');
    if (fromSelect.value) {
      updateToCities(fromSelect.value);
    }
    fromSelect.addEventListener('change', function () {
      updateToCities(this.value);
    });
  });
