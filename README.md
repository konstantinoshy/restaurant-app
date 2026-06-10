# restaurant-app

A restaurant web app with a browsable menu, online ordering, and table reservations. Built with Express and a vanilla JS frontend.

## Getting started

```bash
npm install
npm start
```

Then open http://localhost:3000.

## API

### Menu
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | List all menu items. Optional `?category=` filter (`starters`, `mains`, `desserts`, `drinks`) |
| GET | `/api/menu/:id` | Get a single menu item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place an order: `{ "customerName": "...", "items": [{ "id": 4, "quantity": 2 }] }` |
| GET | `/api/orders` | List all orders |
| GET | `/api/orders/:id` | Get a single order |
| PATCH | `/api/orders/:id` | Update status: `{ "status": "preparing" }` (`pending`, `preparing`, `ready`, `delivered`, `cancelled`) |

### Reservations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reservations` | Book a table: `{ "name": "...", "email": "...", "date": "YYYY-MM-DD", "time": "HH:MM", "partySize": 4 }` |
| GET | `/api/reservations` | List reservations. Optional `?date=YYYY-MM-DD` filter |
| DELETE | `/api/reservations/:id` | Cancel a reservation |

Orders and reservations are stored in memory, so they reset when the server restarts.
