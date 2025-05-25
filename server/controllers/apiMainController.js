const DAO = require('../DB/dao');

const getDAO = (table) => {
  const daoName = `${table.charAt(0).toUpperCase() + table.slice(1)}DAO`;
  return DAO[daoName] || null;
};

module.exports = {
    
  getAll: async (req, res) => {
    try {
      const dao = getDAO(req.params.table);
      if (!dao) throw new Error('Некорректное имя таблицы');
      const data = await dao.GetAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const dao = getDAO(req.params.table);
      if (!dao) throw new Error('Некорректное имя таблицы');
      const data = await dao.GetById(req.params.id);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const dao = getDAO(req.params.table);
      if (!dao) throw new Error('Некорректное имя таблицы');
      const data = await dao.Create(req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const dao = getDAO(req.params.table);
      if (!dao) throw new Error('Некорректное имя таблицы');
      const data = await dao.Update(req.body);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const dao = getDAO(req.params.table);
      if (!dao) throw new Error('Некорректное имя таблицы');
      await dao.Delete(req.body.id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};