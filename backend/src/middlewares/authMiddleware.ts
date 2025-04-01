import { Hono, Context, Next } from 'hono'
import { verify } from 'hono/jwt'

export async function authMiddleware(app: Hono<{ Bindings: { DATABASE_URL: string; JWT_SECRET: string }; Variables: { userId: string } }>) {
    app.use('/api/v1/blog/*', async (c: Context<{ Bindings: { DATABASE_URL: string; JWT_SECRET: string }; Variables: { userId: string } }>, next: Next) => {
        const header = c.req.header("authorization") || "";

        if (!header.startsWith("Bearer ")) {
            c.status(403);
            return c.json({ error: "Unauthorized" });
        }

        const token = header.split(" ")[1];

        try {
            const payload = await verify(token, c.env.JWT_SECRET);
            if (payload?.id) {
                c.set("userId", payload.id as string);
                await next();
            } else {
                c.status(403);
                return c.json({ error: "Unauthorized" });
            }
        } catch (error) {
            c.status(403);
            return c.json({ error: "Invalid token" });
        }
    });
}
