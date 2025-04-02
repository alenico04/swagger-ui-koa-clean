import Router from '@koa/router';
import { Context } from 'koa';
import fs from 'fs';
import path from 'path';
import { User } from '../types';

const router = new Router({
  prefix: '/api/users'
});

const getUsersFromFile = (): { users: User[] } => {
  const data = fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf-8');
  return JSON.parse(data);
};

const saveUsersToFile = (users: { users: User[] }): void => {
  fs.writeFileSync(
    path.join(__dirname, '../data/users.json'),
    JSON.stringify(users, null, 2)
  );
};

router.get('/', (ctx: Context) => {
  const { users } = getUsersFromFile();
  ctx.body = users;
});

router.get('/:id', (ctx: Context) => {
  const { users } = getUsersFromFile();
  const user = users.find(u => u.id === ctx.params.id);
  
  if (!user) {
    ctx.status = 404;
    ctx.body = { error: 'User not found' };
    return;
  }
  
  ctx.body = user;
});

router.post('/', (ctx: Context) => {
  const userData = ctx.request.body as Omit<User, 'id' | 'createdAt'>;
  const { users } = getUsersFromFile();
  
  const newUser: User = {
    id: (users.length + 1).toString(),
    ...userData,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsersToFile({ users });
  
  ctx.status = 201;
  ctx.body = newUser;
});

router.put('/:id', (ctx: Context) => {
  const userData = ctx.request.body as Omit<User, 'id' | 'createdAt'>;
  let { users } = getUsersFromFile();
  
  const index = users.findIndex(u => u.id === ctx.params.id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { error: 'User not found' };
    return;
  }
  
  users[index] = {
    ...users[index],
    ...userData
  };
  
  saveUsersToFile({ users });
  ctx.body = users[index];
});

router.delete('/:id', (ctx: Context) => {
  let { users } = getUsersFromFile();
  
  const index = users.findIndex(u => u.id === ctx.params.id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { error: 'User not found' };
    return;
  }
  
  users = users.filter(u => u.id !== ctx.params.id);
  saveUsersToFile({ users });
  
  ctx.body = { message: 'User deleted successfully' };
});

export const userRoutes = router;