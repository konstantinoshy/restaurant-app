const express = require('express');
const router = express.Router();
const menu = require('../data/menu');

// GET /api/menu?category=mains
router.get('/', (req, res) => {
    const { category } = req.query;
    if (category) {
        return res.json(menu.filter(item => item.category === category));
    }
    res.json(menu);
});

// GET /api/menu/:id
router.get('/:id', (req, res) => {
    const item = menu.find(i => i.id === Number(req.params.id));
    if (!item) {
        return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(item);
});

module.exports = router;
