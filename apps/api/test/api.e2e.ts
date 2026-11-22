import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

process.env.SQLITE_PATH = ':memory:';

import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup';

type P = { id: string; content: string };

describe('API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterAll(() => app.close());

  const creds = { username: 'alice', password: 'password123' };

  it('rejects unauthenticated access to the feed', async () => {
    await request(app.getHttpServer()).get('/posts').expect(401);
  });

  it('validates credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'a', password: 'short' })
      .expect(400);
  });

  it('registers, rejects duplicates and wrong passwords', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(creds).expect(201);
    await request(app.getHttpServer()).post('/auth/register').send(creds).expect(409);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ ...creds, password: 'wrong-password' })
      .expect(401);
  });

  it('runs the full feed flow with a cookie session', async () => {
    const agent = request.agent(app.getHttpServer());
    const login = await agent.post('/auth/login').send(creds).expect(200);
    expect(login.headers['set-cookie'][0]).toContain('HttpOnly');
    await agent.get('/auth/me').expect(200).expect({ id: login.body.user.id, username: 'alice' });

    const first = await agent.post('/posts').send({ content: '  first post  ' }).expect(201);
    expect(first.body).toMatchObject({ content: 'first post', likeCount: 0, likedByMe: false });
    await agent.post('/posts').send({ content: '' }).expect(400);
    await agent.post('/posts').send({ content: 'second post' }).expect(201);

    const feed = await agent.get('/posts').expect(200);
    expect(feed.body.map((p: P) => p.content)).toEqual(['second post', 'first post']);

    const url = `/posts/${first.body.id}/like`;
    await agent.post(url).expect(200);
    const liked = await agent.post(url).expect(200);
    expect(liked.body).toMatchObject({ likeCount: 1, likedByMe: true });

    const unliked = await agent.delete(url).expect(200);
    expect(unliked.body).toMatchObject({ likeCount: 0, likedByMe: false });
    await agent.post('/posts/does-not-exist/like').expect(404);
  });

  it('counts likes per user and personalises likedByMe', async () => {
    const alice = request.agent(app.getHttpServer());
    const bob = request.agent(app.getHttpServer());
    await alice.post('/auth/login').send(creds).expect(200);
    await bob.post('/auth/register').send({ username: 'bob', password: 'password123' }).expect(201);

    const post = await alice.post('/posts').send({ content: 'shared' }).expect(201);
    const url = `/posts/${post.body.id}/like`;
    await alice.post(url).expect(200);
    await bob.post(url).expect(200);

    const bobFeed = await bob.get('/posts').expect(200);
    expect(bobFeed.body.find((p: P) => p.id === post.body.id)).toMatchObject({
      likeCount: 2,
      likedByMe: true,
    });
    await bob.delete(url).expect(200);
    const aliceFeed = await alice.get('/posts').expect(200);
    expect(aliceFeed.body.find((p: P) => p.id === post.body.id)).toMatchObject({
      likeCount: 1,
      likedByMe: true,
    });
  });

  it('clears the session on logout', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.post('/auth/login').send(creds).expect(200);
    await agent.post('/auth/logout').expect(204);
    await agent.get('/auth/me').expect(401);
  });
});
