import { Hono } from 'hono'
import { blogController } from '../controllers/blogController'

export const blogRoute = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    }
}>();

blogRoute.route('/blog', blogController);
