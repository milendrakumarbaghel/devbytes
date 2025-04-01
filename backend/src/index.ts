import { Hono } from 'hono'
import { userRoute } from './routes/user.route'
import { blogRoute } from './routes/blog.route'
import { authMiddleware } from './middlewares/authMiddleware';

const app = new Hono<{
	Bindings: {
		DATABASE_URL: string,
    	JWT_SECRET: string,
	}
}>();

// Middleware for authentication
// authMiddleware(app);

app.route('/api/v1/', userRoute)
app.route('/api/v1/', blogRoute)

// c-> context
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
