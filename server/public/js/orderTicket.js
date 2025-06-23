async function fetchStopInfo() {
    const stopId = document.getElementById('stop_id').value;
    try {
      const response = await fetch(`/api/stops/${stopId}`);
      if (!response.ok) throw new Error('Ошибка запроса');
  
      const stop = await response.json();
  
      const content = `
        <h3>Информация об остановке</h3>
        <p><strong>Название:</strong> ${stop.name}</p>
        <p><strong>Адрес:</strong> ${stop.address}</p>
        <p><strong>Время отправления с остановки:</strong> ${stop.time}</p>
      `;
  
      document.getElementById('popup-content').innerHTML = content;
  
     
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  }
  

  function closePopup() {
    document.getElementById('popup').style.display = 'none';
  }
