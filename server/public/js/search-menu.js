function updateToCities(fromCityId, selectedToCityId = null) {
  fetch(`/api/routes-from-city?fromCity=${encodeURIComponent(fromCityId)}`)
    .then(response => response.json())
    .then(data => {
      const toSelect = document.getElementById('to');
      toSelect.innerHTML = '<option value="" disabled>Выберите город</option>'; // Убрали selected

      if (data.toCities && Array.isArray(data.toCities)) {
        data.toCities.forEach(city => {
          const option = document.createElement('option');
          option.value = city.id;
          option.textContent = city.name;
          if (String(city.id) === String(selectedToCityId)) {
            option.selected = true;
          }
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
  const toValue = "<%= query?.to || '' %>";

  if (fromSelect.value) {
    updateToCities(fromSelect.value, toValue);
  }

  fromSelect.addEventListener('change', function () {
    updateToCities(this.value);
  });

  const dateInput = document.getElementById("date");
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  if (!dateInput.value) {
    dateInput.value = today;
  }
});
