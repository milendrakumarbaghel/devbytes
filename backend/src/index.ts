import { Hono } from 'hono'
import { userRoute } from './routes/user.route'
import { blogRoute } from './routes/blog.route'
import { cors } from 'hono/cors';

const app = new Hono<{
	Bindings: {
		DATABASE_URL: string,
    	JWT_SECRET: string,
	}
}>();

app.use('*', cors({
	origin: [
      'http://localhost:5173',
      'https://devbytes-tau.vercel.app',
    ],
	allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowHeaders: ['Content-Type', 'Authorization'],
	credentials: true
  }));

app.route('/api/v1/', userRoute)
app.route('/api/v1/', blogRoute)

// c-> context
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
