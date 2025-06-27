
import products from './db/products.json';
import users from './db/users.json';
import orders from './db/orders.json';

export const db = {
  products,
  users,
  orders,
};

export type Product = (typeof products)[0];
export type User = (typeof users)[0];
export type Order = (typeof orders)[0];
