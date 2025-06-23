function initCustomSelect(startTime) {
    const flightStartTime = new Date(startTime);
    const selectedOption = document.getElementById('selectedOption');
    const optionsList = document.getElementById('optionsList');
    const customSelect = document.getElementById('customSelect');
    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');

    if (!selectedOption || !optionsList || !customSelect) return; // защита

    let selectedStop = null;

    const allOptions = optionsList.querySelectorAll('.option');
    allOptions.forEach(optionDiv => {
        const time = optionDiv.dataset.time;
        const timeParts = time.split(':');
        const arrival = new Date(flightStartTime);
        arrival.setHours(arrival.getHours() + parseInt(timeParts[0]));
        arrival.setMinutes(arrival.getMinutes() + parseInt(timeParts[1]));
        arrival.setSeconds(arrival.getSeconds() + parseInt(timeParts[2]));

        const arrivalElem = optionDiv.querySelector('.arrival-time');
        if (arrivalElem) {
            const dateStr = arrival.toLocaleDateString();
            const timeStr = arrival.toLocaleTimeString();
            arrivalElem.textContent = `(${dateStr} ${timeStr})`;
        }

    });

    selectedOption.addEventListener('click', () => {
        optionsList.style.display = optionsList.style.display === 'block' ? 'none' : 'block';
    });

    optionsList.addEventListener('click', (e) => {
        const optionDiv = e.target.closest('.option');
        if (!optionDiv) return;

        const name = optionDiv.dataset.name;
        const address = optionDiv.dataset.address;
        const time = optionDiv.dataset.time;
        const timeParts = time.split(':');

        const arrival = new Date(flightStartTime);
        arrival.setHours(arrival.getHours() + parseInt(timeParts[0]));
        arrival.setMinutes(arrival.getMinutes() + parseInt(timeParts[1]));
        arrival.setSeconds(arrival.getSeconds() + parseInt(timeParts[2]));

        if (e.target.classList.contains('info-icon')) {
            e.stopPropagation();
            popupContent.innerHTML = `
          <strong>Остановка:</strong> ${name}<br>
          <strong>Адрес:</strong> ${address}<br>
          <strong>Время отправления:</strong> ${arrival.toLocaleString()}
        `;
            popup.style.display = 'block';
            
            showMapOnPopup( optionDiv.dataset.latitude,
                optionDiv.dataset.longitude,
                optionDiv.dataset.address
            );
             
            return;
        }

        selectedStop = {
            stop_id: optionDiv.dataset.id,
            name,
            address,
            time
        };
        document.getElementById('selectedStopId').value = selectedStop.stop_id;

        selectedOption.textContent = selectedStop.name;
        optionsList.style.display = 'none';
    });

    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            optionsList.style.display = 'none';
        }
    });
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}





let map = null;
let placemark = null;

function showMapOnPopup(lat, lon, address) {
  const popup = document.getElementById('popup');
  const mapContainer = document.getElementById('popup-map');

  popup.style.display = 'block';

  setTimeout(() => {
    ymaps.ready(function () {
      if (!map) {
        map = new ymaps.Map(mapContainer, {
          center: [lat, lon],
          zoom: 14,
          controls: ['zoomControl']
        });

        placemark = new ymaps.Placemark([lat, lon], {
          balloonContent: address
        });

        map.geoObjects.add(placemark);
      } else {
        map.setCenter([lat, lon]);
        placemark.geometry.setCoordinates([lat, lon]);
        placemark.properties.set('balloonContent', address);
      }
    });
  }, 100);
}
