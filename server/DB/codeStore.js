const codes = [];

module.exports = {
  addCode(id, code) {
    // Обновить код, если id уже есть
    const index = codes.findIndex(item => item.id === id);
    if (index !== -1) {
      codes[index].code = code;
    } else {
      codes.push({ id, code });
    }
  },

  getCode(id) {
    const item = codes.find(item => item.id === id);
    return item ? item.code : null;
  },

  removeCode(id) {
    const index = codes.findIndex(item => item.id === id);
    if (index !== -1) {
      codes.splice(index, 1);
    }
  },
  findUserIdByCode(code) {
    const entry = codes.find(item => item.code === code);
    return entry ? entry.id : null;
  },
  // Для отладки (если нужно)
  getAll() {
    return codes;
  }
};
