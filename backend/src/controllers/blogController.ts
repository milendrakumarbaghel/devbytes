import { Hono, Context, Next } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from 'hono/jwt'
import { authMiddleware } from '../middlewares/authMiddleware';
import { createBlogInput } from '@milendrakumarbaghel/blogging-site';
import { updateBlogInput } from '@milendrakumarbaghel/blogging-site';

export const blogController = new Hono<{
	Bindings: {
		DATABASE_URL: string,
		JWT_SECRET: string,
	},
	Variables: {
		userId: string
	}
}>();

authMiddleware(blogController);

blogController.post('/', async (c: Context) => {
	const userId = c.get('userId');
	console.log(userId);
	if (!userId) {
		c.status(401);
		return c.json({ error: "Unauthorized" });
	}

	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const { success } = createBlogInput.safeParse(body);

	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}

	const post = await prisma.post.create({
		data: {
			title: body.title,
			content: body.content,
			authorId: userId
		}
	});
	return c.json({ id: post.id });
});

blogController.put('/updateblog', async (c: Context) => {
	const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const { success } = updateBlogInput.safeParse(body);

	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}

	await prisma.post.update({
		where: {
			id: body.id,
			authorId: userId
		},
		data: {
			title: body.title,
			content: body.content
		}
	});

	return c.text('Updated post');
});

blogController.get('/findblog/:id', async (c: Context) => {
	const id = c.req.param('id');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

	const post = await prisma.post.findUnique({
		where: { id }
	});

	if (!post) {
		c.status(404);
		return c.json({ error: "Post not found" });
	}

	return c.json(post);
});

blogController.get('/findAllBlogs', async (c: Context) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

	const posts = await prisma.post.findMany();

	return c.json(posts);
});
