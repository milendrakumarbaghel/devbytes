import { Hono } from 'hono'
import { userRoute } from './routes/user.route'
import { blogRoute } from './routes/blog.route'

// const prisma = new PrismaClient().$extends(withAccelerate())

const app = new Hono<{
	Bindings: {
		DATABASE_URL: string,
    JWT_SECRET: string,
	}
}>();

app.route('/api/v1/', userRoute)
app.route('/api/v1/', blogRoute)

// c-> context
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
