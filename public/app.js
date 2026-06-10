const state = {
    menu: [],          // full menu, used for cart lookups
    activeCategory: '',
    cart: new Map()    // id -> quantity
};

const menuGrid = document.getElementById('menu-grid');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const orderForm = document.getElementById('order-form');
const orderMessage = document.getElementById('order-message');
const reservationForm = document.getElementById('reservation-form');
const reservationMessage = document.getElementById('reservation-message');

function formatPrice(value) {
    return `€${value.toFixed(2)}`;
}

async function loadMenu() {
    const res = await fetch('/api/menu');
    state.menu = await res.json();
    renderMenu();
}

function renderMenu() {
    menuGrid.innerHTML = '';
    const visible = state.activeCategory
        ? state.menu.filter(item => item.category === state.activeCategory)
        : state.menu;
    for (const item of visible) {
        const card = document.createElement('div');
        card.className = 'menu-card';

        const title = document.createElement('h3');
        title.textContent = item.name;

        const price = document.createElement('span');
        price.className = 'price';
        price.textContent = formatPrice(item.price);

        const desc = document.createElement('p');
        desc.className = 'description';
        desc.textContent = item.description;

        const btn = document.createElement('button');
        btn.className = 'add-btn';
        btn.textContent = 'Add to order';
        btn.addEventListener('click', () => addToCart(item.id));

        card.append(title, price, desc, btn);
        menuGrid.appendChild(card);
    }
}

function addToCart(id) {
    state.cart.set(id, (state.cart.get(id) || 0) + 1);
    renderCart();
}

function changeQuantity(id, delta) {
    const qty = (state.cart.get(id) || 0) + delta;
    if (qty <= 0) {
        state.cart.delete(id);
    } else {
        state.cart.set(id, qty);
    }
    renderCart();
}

function renderCart() {
    cartItemsEl.innerHTML = '';
    if (state.cart.size === 0) {
        cartItemsEl.innerHTML = '<p class="empty-note">Your cart is empty. Add something from the menu!</p>';
        cartTotalEl.textContent = '';
        orderForm.hidden = true;
        return;
    }

    let total = 0;
    for (const [id, qty] of state.cart) {
        const item = state.menu.find(m => m.id === id);
        if (!item) continue;
        total += item.price * qty;

        const row = document.createElement('div');
        row.className = 'cart-row';

        const name = document.createElement('span');
        name.textContent = `${item.name} × ${qty}`;

        const controls = document.createElement('span');
        controls.className = 'qty-controls';
        const minus = document.createElement('button');
        minus.textContent = '−';
        minus.addEventListener('click', () => changeQuantity(id, -1));
        const plus = document.createElement('button');
        plus.textContent = '+';
        plus.addEventListener('click', () => changeQuantity(id, 1));
        controls.append(minus, ' ', plus);

        const price = document.createElement('span');
        price.textContent = formatPrice(item.price * qty);

        row.append(name, controls, price);
        cartItemsEl.appendChild(row);
    }

    cartTotalEl.textContent = `Total: ${formatPrice(total)}`;
    orderForm.hidden = false;
}

function showMessage(el, text, isError) {
    el.textContent = text;
    el.className = `message ${isError ? 'error' : 'success'}`;
    el.hidden = false;
}

orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const customerName = document.getElementById('order-name').value;
    const items = [...state.cart].map(([id, quantity]) => ({ id, quantity }));

    const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, items })
    });
    const data = await res.json();

    if (!res.ok) {
        showMessage(orderMessage, data.error || 'Something went wrong', true);
        return;
    }

    state.cart.clear();
    renderCart();
    orderForm.reset();
    showMessage(orderMessage, `Order #${data.id} placed! Total ${formatPrice(data.total)}. We'll start preparing it right away.`, false);
});

reservationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        name: document.getElementById('res-name').value,
        email: document.getElementById('res-email').value,
        date: document.getElementById('res-date').value,
        time: document.getElementById('res-time').value,
        partySize: Number(document.getElementById('res-party').value)
    };

    const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok) {
        showMessage(reservationMessage, data.error || 'Something went wrong', true);
        return;
    }

    reservationForm.reset();
    showMessage(reservationMessage, `Table booked for ${data.partySize} on ${data.date} at ${data.time}. See you soon, ${data.name}!`, false);
});

document.getElementById('category-filters').addEventListener('click', (e) => {
    if (!e.target.matches('.filter-btn')) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    state.activeCategory = e.target.dataset.category;
    renderMenu();
});

// Prevent picking a past date for reservations
document.getElementById('res-date').min = new Date().toISOString().split('T')[0];

loadMenu();
