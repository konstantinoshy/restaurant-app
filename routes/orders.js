const express = require('express');
const router = express.Router();
const menu = require('../data/menu');

const orders = [];
let nextOrderId = 1;

// POST /api/orders  { customerName, items: [{ id, quantity }] }
router.post('/', (req, res) => {
    const { customerName, items } = req.body;

    if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
        return res.status(400).json({ error: 'customerName is required' });
    }
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'items must be a non-empty array' });
    }

    const orderItems = [];
    for (const { id, quantity } of items) {
        const menuItem = menu.find(m => m.id === Number(id));
        if (!menuItem) {
            return res.status(400).json({ error: `Unknown menu item id: ${id}` });
        }
        const qty = Number(quantity);
        if (!Number.isInteger(qty) || qty < 1) {
            return res.status(400).json({ error: `Invalid quantity for item ${id}` });
        }
        orderItems.push({
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: qty
        });
    }

    const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order = {
        id: nextOrderId++,
        customerName: customerName.trim(),
        items: orderItems,
        total: Math.round(total * 100) / 100,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    orders.push(order);
    res.status(201).json(order);
});

// GET /api/orders
router.get('/', (req, res) => {
    res.json(orders);
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
    const order = orders.find(o => o.id === Number(req.params.id));
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
});

// PATCH /api/orders/:id  { status }
router.patch('/:id', (req, res) => {
    const order = orders.find(o => o.id === Number(req.params.id));
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    const { status } = req.body;
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }
    order.status = status;
    res.json(order);
});

module.exports = router;
