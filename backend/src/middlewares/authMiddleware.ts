import { Hono, Context, Next } from 'hono'
import { verify } from 'hono/jwt'

const app = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    }
}>();

export async function authMiddleware(app: Hono<{ Bindings: { DATABASE_URL: string; JWT_SECRET: string } }>) {
    app.use('/api/v1/blog/*', async (c: Context, next: Next) => {
        const header = c.req.header("authorization") || "";

        // Bearer token => ["Bearer", "token"];
        const token = header.split(" ")[1]
        const response = await verify(token, c.env.JWT_SECRET)

        if (response.id) {
          next()
        } else {
          c.status(403)
          return c.json({ error: "unauthorized" })
        }
    })
}
