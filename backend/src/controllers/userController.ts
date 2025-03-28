import { Hono, Context } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
import bcrypt from 'bcryptjs'

export const userController = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    }
}>();

userController.post('signup', async (c: Context) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body = await c.req.json();

    if (!body.email || !body.password) {
        c.status(400);
        return c.json({ error: "email and password are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(body.password, 10); // 10 is the salt rounds
        const user = await prisma.user.create({
            data: {
                email: body.email,
                password: hashedPassword
            }
        });

        const token = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({
            jwt: token
        });
    } catch (e) {
        c.status(403);
        console.log(e);
        return c.json({
            error: "error while signing up"
        });
    }
})

userController.post('signin', async (c: Context) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body = await c.req.json();

    if (!body.email || !body.password) {
        c.status(400);
        return c.json({ error: "email and password are required" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        });

        if (!user) {
            c.status(403);
            return c.json({ error: "invalid credentials (user not found)" });
        }

        const isValidPassword = await bcrypt.compare(body.password, user.password);

        if (!isValidPassword) {
            c.status(403);
            return c.json({ error: "invalid credentials (password)" });
        }

        const token = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({
            jwt: token
        });
    } catch (e) {
        console.log(e);
        c.status(500);
        return c.json({
            error: "error while logging in"
        });
    }
})
