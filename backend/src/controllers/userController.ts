import { Hono, Context } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'

export const userController = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    }
}>();

async function hashPassword(password: string, salt: string) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
    );

    const derivedKey = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: enc.encode(salt),
            iterations: 100000,
            hash: "SHA-256",
        },
        key,
        256
    );

    return btoa(String.fromCharCode(...new Uint8Array(derivedKey)));
}

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
        const salt = crypto.randomUUID();
        const hashedPassword = await hashPassword(body.password, salt);

        const user = await prisma.user.create({
            data: {
                email: body.email,
                password: hashedPassword + ':' + salt, // Store hash:salt format
                name : body.name || null,
            }
        });

        const token = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({ jwt: token });
    } catch (e) {
        c.status(403);
        console.log(e);
        return c.json({ error: "error while signing up" });
    }
});

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

        const [storedHash, salt] = user.password.split(':');
        const hashedInputPassword = await hashPassword(body.password, salt);

        if (hashedInputPassword !== storedHash) {
            c.status(403);
            return c.json({ error: "invalid credentials (password)" });
        }

        const token = await sign({ id: user.id }, c.env.JWT_SECRET);
        // ✅ Backend does NOT store JWTs. The client should store it.
        // The client should store the JWT in local storage or cookies.
        // The client should send the JWT in the Authorization header for protected routes.
        return c.json({ jwt: token });
    } catch (e) {
        console.log(e);
        c.status(500);
        return c.json({ error: "error while logging in" });
    }
});

userController.get('/signout', async (c: Context) => {
    // ✅ Backend does NOT store JWTs. The client should remove it.
    return c.json({ message: "Signed out. Remove JWT from client storage." });
});

userController.get('/me', async (c: Context) => {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
        c.status(401);
        return c.json({ error: "unauthorized" });
    }

    try {
        const payload = await verify(token, c.env.JWT_SECRET) as { id: string };
        const userId: string = payload.id;

        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                email: true,
            }
        });

        if (!user) {
            c.status(404);
            return c.json({ error: "user not found" });
        }

        return c.json(user);
    } catch (e) {
        console.log(e);
        c.status(401);
        return c.json({ error: "invalid token" });
    }
});
