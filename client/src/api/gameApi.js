import axios from 'axios';

export const gameApi = {
  getState:        ()     => axios.get('/api/game/state').then(r => r.data),
  getStorage:      ()     => axios.get('/api/game/storage').then(r => r.data),
  saveState:       (body) => axios.post('/api/game/save', body).then(r => r.data),

  startCooking:    (body) => axios.post('/api/cook/start', body).then(r => r.data),
  getTimers:       ()     => axios.get('/api/cook/timers').then(r => r.data),
  collectDish:     (body) => axios.post('/api/cook/collect', body).then(r => r.data),
  skipWithGem:     (body) => axios.post('/api/cook/skip-gem', body).then(r => r.data),

  getMarketStock:  ()     => axios.get('/api/market/stock').then(r => r.data),
  buyIngredient:   (body) => axios.post('/api/market/buy', body).then(r => r.data),

  seatCustomer:    (body) => axios.post('/api/customers/seat', body).then(r => r.data),
  serveCustomer:   (body) => axios.post('/api/customers/serve', body).then(r => r.data),
  collectPayment:  (body) => axios.post('/api/customers/collect', body).then(r => r.data),
  dismissCustomer: (body) => axios.post('/api/customers/dismiss', body).then(r => r.data),

  hireChef:        (body) => axios.post('/api/restaurant/hire-chef', body).then(r => r.data),

  updateSettings:  (body) => axios.patch('/api/profile/settings', body).then(r => r.data),
  renameRestaurant:(body) => axios.patch('/api/profile/restaurant-name', body).then(r => r.data),
};
