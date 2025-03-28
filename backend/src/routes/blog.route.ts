import { Hono } from 'hono'
import { blogController } from '../controllers/blogController'
import { authMiddleware } from '../middlewares/authMiddleware'

export const blogRoute = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    }
}>()

blogRoute.route('/blog', blogController);
