import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import { userRoutes } from './routes/users';
import dotenv from "dotenv";

const app = new Koa();
const router = new Router();
dotenv.config();

const PORT = process.env.APP_PORT || 3001;

// Middleware
app.use(bodyParser());

// Add router middleware
app.use(router.routes());
app.use(router.allowedMethods());

// Setup user routes
app.use(userRoutes.routes());
app.use(userRoutes.allowedMethods());

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});