import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import { userRoutes } from './routes/users';
import dotenv from "dotenv";
import { swaggerSpec } from './swagger';
import { koaSwagger } from 'koa2-swagger-ui';


const app = new Koa();
const router = new Router();
dotenv.config();

const PORT = process.env.APP_PORT || 3001;

console.log(swaggerSpec)

//router.get('/swagger-json', koaSwagger({ swaggerOptions: { spec: swaggerSpec as Record<string, unknown> }}));
router.get('/swagger', (ctx) => {
  ctx.body = swaggerSpec;
});

app.use(koaSwagger({
  routePrefix: '/docs',
  swaggerOptions: {
    url: '/swagger'
  }
}))

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

