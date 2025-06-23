function enableTableSorting(tableSelector) {
    document.querySelectorAll(tableSelector).forEach(table => {
      const thead = table.querySelector('thead');
      const tbody = table.querySelector('tbody');
      if (!thead || !tbody) return;
  
      const ths = thead.querySelectorAll('th');
  
      ths.forEach((th, colIndex) => {
        const type = th.dataset.sort;
        if (!type) return;
  
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.gap = '2px';
  
        const upBtn = createSortButton('/pictures/sort-up.png', () => sortTable(tbody, colIndex, type, true));
        const downBtn = createSortButton('/pictures/sort-down.png', () => sortTable(tbody, colIndex, type, false));
  
        container.appendChild(upBtn);
        container.appendChild(downBtn);
  
        // Сохраняем текст заголовка
        const headerText = th.textContent.trim();
  
        th.innerHTML = '';
        const span = document.createElement('span');
        span.textContent = headerText;
        span.style.marginRight = '8px';
  
        th.appendChild(span);
        th.appendChild(container);
      });
    });
  
    function createSortButton(imgSrc, onClick) {
        const btn = document.createElement('button');
        btn.style.border = 'none';
        btn.style.background = 'transparent';
        btn.style.cursor = 'pointer';
        btn.style.padding = '0';
        btn.style.margin = '0';
        btn.style.width = '16px';
        btn.style.height = '16px';
      
        const img = document.createElement('img');
        img.src = imgSrc;
        img.style.width = '16px';
        img.style.height = '16px';
        img.style.display = 'block';
      
        btn.appendChild(img);
        btn.addEventListener('click', onClick);
        return btn;
      }
      
  
    function sortTable(tbody, colIndex, type, asc) {
      const rows = Array.from(tbody.querySelectorAll('tr'));
  
      rows.sort((a, b) => {
        const valA = getCellValue(a.children[colIndex]);
        const valB = getCellValue(b.children[colIndex]);
  
        let res;
        if (type === 'number') res = Number(valA) - Number(valB);
        else res = String(valA).localeCompare(String(valB), 'ru');
  
        return asc ? res : -res;
      });
  
      rows.forEach(row => tbody.appendChild(row));
    }
  
    function getCellValue(cell) {
      const input = cell.querySelector('input, select');
      if (input) {
        if (input.tagName === 'SELECT') {
          return input.options[input.selectedIndex].text;
        }
        return input.value;
      }
      return cell.textContent.trim();
    }
  }
  