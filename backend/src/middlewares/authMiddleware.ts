import { Hono, Context, Next } from 'hono';
import { verify } from 'hono/jwt';

export function authMiddleware(app: Hono<{ Bindings: { DATABASE_URL: string; JWT_SECRET: string }, Variables: { userId: string } }>) {
    app.use('/*', async (c: Context, next: Next) => {
        try {
            const authHeader = c.req.header('Authorization');

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                c.status(401);
                return c.json({ error: "Unauthorized: Missing or invalid token" });
            }

            const token = authHeader.split(' ')[1];

            if (!token) {
                c.status(401);
                return c.json({ error: "Unauthorized: Token not found" });
            }

            // Verify the token
            const payload = await verify(token, c.env.JWT_SECRET);

            if (!payload || !payload.id) {
                c.status(401);
                return c.json({ error: "Unauthorized: Invalid token" });
            }

            // Set userId in context
            c.set('userId', payload.id);

            console.log("Authenticated User ID:", payload.id);

            await next();
        } catch (error) {
            console.error("JWT Verification Error:", error);
            c.status(403);
            return c.json({ error: "Unauthorized: Token verification failed" });
        }
    });
}
