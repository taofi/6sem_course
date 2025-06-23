function enableTableSearch(tableSelector) {
  document.querySelectorAll(tableSelector).forEach(table => {
    const container = document.createElement('div');
    container.style.marginBottom = '10px';
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '10px';

    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = 'Поиск...';
    input.style.padding = '4px 8px';
    input.style.flexGrow = '1';
    input.style.maxWidth = '400px';

    const selectColumn = document.createElement('select');
    const thead = table.querySelector('thead');
    if (!thead) return;

    const headers = Array.from(thead.querySelectorAll('th'));
    const searchableCount = headers.length - 1;

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'Все столбцы';
    selectColumn.appendChild(allOption);

    headers.slice(0, searchableCount).forEach((th, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = th.textContent.trim();
      selectColumn.appendChild(opt);
    });

    container.appendChild(input);
    container.appendChild(selectColumn);

    const columnFilters = [];

    headers.slice(0, searchableCount).forEach((_, colIndex) => {
      const cells = Array.from(table.querySelectorAll(`tbody tr td:nth-child(${colIndex + 1})`));
      const hasSelect = cells.some(td => td.querySelector('select'));

      if (hasSelect) {
        const values = new Set();
        cells.forEach(td => {
          const sel = td.querySelector('select');
          if (sel) {
            Array.from(sel.options).forEach(opt => values.add(opt.text));
          }
        });

        const filter = document.createElement('select');
        filter.dataset.colIndex = colIndex;
        filter.style.padding = '4px 8px';

        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = headers[colIndex].textContent.trim();
        filter.appendChild(defaultOpt);

        Array.from(values).sort().forEach(val => {
          const opt = document.createElement('option');
          opt.value = val.toLowerCase();
          opt.textContent = val;
          filter.appendChild(opt);
        });

        container.appendChild(filter);
        columnFilters.push(filter);
      }
    });

    table.parentNode.insertBefore(container, table);

    input.addEventListener('input', filterRows);
    selectColumn.addEventListener('change', filterRows);
    columnFilters.forEach(sel => sel.addEventListener('change', filterRows));

    function getCellText(cell) {
      const input = cell.querySelector('input, select');
      if (input) {
        if (input.tagName === 'SELECT') {
          return input.options[input.selectedIndex].text;
        }
        return input.value;
      }
      return cell.textContent.trim();
    }

    function filterRows() {
      const query = input.value.trim().toLowerCase();
      const colIndex = selectColumn.value;
      const tbody = table.querySelector('tbody');
      if (!tbody) return;

      tbody.querySelectorAll('tr').forEach(row => {
        let textMatch = false;
        if (colIndex === 'all') {
          const allText = Array.from(row.children)
            .slice(0, searchableCount)
            .map(cell => getCellText(cell))
            .join(' ')
            .toLowerCase();
          textMatch = allText.includes(query);
        } else {
          const cell = row.children[colIndex];
          const text = cell ? getCellText(cell).toLowerCase() : '';
          textMatch = text.includes(query);
        }

        let filtersMatch = true;
        for (const filter of columnFilters) {
          const colIdx = parseInt(filter.dataset.colIndex);
          const val = filter.value;
          if (!val) continue;
          const cell = row.children[colIdx];
          const text = cell ? getCellText(cell).toLowerCase() : '';
          if (text !== val) {
            filtersMatch = false;
            break;
          }
        }

        row.style.display = textMatch && filtersMatch ? '' : 'none';
      });
    }
  });
}
