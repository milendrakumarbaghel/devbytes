import { Hono } from 'hono'
import { userController } from '../controllers/userController'

export const userRoute = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    }
}>();

userRoute.route('/user', userController)
