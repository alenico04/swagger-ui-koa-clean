import Router from '@koa/router';
import { Context } from 'koa';
import fs from 'fs';
import path from 'path';
import { User } from '../types';

const router = new Router({
  prefix: '/api/users'
});

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API per la gestione delle categorie di prodotti
 */

const getUsersFromFile = (): { users: User[] } => { //prende i dati di un database come un json semplice
  const data = fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf-8');
  return JSON.parse(data);
};

const saveUsersToFile = (users: { users: User[] }): void => { //salva i dati nel json
  fs.writeFileSync(
    path.join(__dirname, '../data/users.json'),
    JSON.stringify(users, null, 2)
  );
};

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Ottiene tutti gli utenti
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista di tutti gli utenti
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   roles:
 *                     type: string
 *                   created_at:
 *                     type: datatime
 *       500:
 *         description: Errore interno del server
 */

router.get('/', (ctx: Context) => { // restituisce tutti gli utenti
  const { users } = getUsersFromFile();
  ctx.body = users;
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Ottiene un utente per ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID dell' utente
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dettagli del utente richiesto
 *       404:
 *         description: Utente non trovato
 *       500:
 *         description: Errore interno del server
 */

router.get('/:id', (ctx: Context) => { //restituisce i dati di uno soecifico utente
  const { users } = getUsersFromFile();
  const user = users.find(u => u.id === ctx.params.id);
  
  if (!user) {
    ctx.status = 404;
    ctx.body = { error: 'User not found' };
    return;
  }
  
  ctx.body = user;
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crea un nuovo utente
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome dell' utente
 *               email:
 *                 type: string
 *                 description: Email dell' utente
 *               role:
 *                 type: string
 *                 description: ruolo dell' utente
 *     responses:
 *       201:
 *         description: Utente creato con successo
 *       400:
 *         description: Dati non validi
 *       500:
 *         description: Errore interno del server
 */

router.post('/', (ctx: Context) => { //inserisce i dati di un utente tramite un json
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

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Aggiorna un utente esistente
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID della categoria da aggiornare
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *             name:
 *                 type: string
 *                 description: Nome aggiornato dell'utente
 *             email:
 *                 type: string
 *                 description: Email aggiornata della utente
 *     responses:
 *       200:
 *         description: Utente aggiornato con successo
 *       400:
 *         description: Dati non validi
 *       404:
 *         description: Utente non trovato
 *       500:
 *         description: Errore interno del server
 */

router.put('/:id', (ctx: Context) => { //aggiorna i dati di un utente tramite il json
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

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Elimina un utente
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID dell' utente da eliminare
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utente eliminato con successo
 *       404:
 *         description: Utente non trovata
 *       500:
 *         description: Errore interno del server
 */

router.delete('/:id', (ctx: Context) => { //elimina uno specifico utente che corrisponde al id
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