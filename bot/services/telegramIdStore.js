let telegramIds = [];

module.exports = {
  set(ids) {
    telegramIds = ids;
  },

  get() {
    return telegramIds;
  },

  add(id) {
    if (!telegramIds.includes(id)) {
      telegramIds.push(id);
    }
  },

  has(id) {
    return telegramIds.includes(id);
  },

  clear() {
    telegramIds = [];
  },
};
