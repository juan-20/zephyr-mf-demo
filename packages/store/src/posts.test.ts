import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Post } from '@repo/types';
import { usePosts } from './posts';
import { useSession } from './session';

const post = (over: Partial<Post> = {}): Post => ({
  id: 'p1',
  author: { id: 'u1', username: 'alice' },
  content: 'hello',
  createdAt: '2026-01-01T00:00:00.000Z',
  likeCount: 0,
  likedByMe: false,
  ...over,
});

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

describe('posts store', () => {
  beforeEach(() => {
    usePosts.setState({ posts: [post()], loading: false, error: null });
    useSession.setState({ user: { id: 'u1', username: 'alice' }, status: 'authed' });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('likes optimistically and keeps the server result', async () => {
    let resolve!: (r: Response) => void;
    vi.stubGlobal('fetch', () => new Promise<Response>((r) => (resolve = r)));
    const pending = usePosts.getState().toggleLike('p1');
    expect(usePosts.getState().posts[0]).toMatchObject({ likedByMe: true, likeCount: 1 });
    resolve(new Response(JSON.stringify(post({ likedByMe: true, likeCount: 3 }))));
    await pending;
    expect(usePosts.getState().posts[0].likeCount).toBe(3);
  });

  it('rolls back when the request fails', async () => {
    vi.stubGlobal('fetch', () => json({ message: 'boom' }, 500));
    await usePosts.getState().toggleLike('p1');
    expect(usePosts.getState().posts[0]).toMatchObject({ likedByMe: false, likeCount: 0 });
    expect(usePosts.getState().error).toBe('boom');
  });

  it('ignores a second click while a like is in flight', async () => {
    const fetchMock = vi.fn(() => json(post({ likedByMe: true, likeCount: 1 })));
    vi.stubGlobal('fetch', fetchMock);
    await Promise.all([usePosts.getState().toggleLike('p1'), usePosts.getState().toggleLike('p1')]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('prepends a created post', async () => {
    vi.stubGlobal('fetch', () => json(post({ id: 'p2', content: 'new' }), 201));
    expect(await usePosts.getState().create('new')).toBe(true);
    expect(usePosts.getState().posts.map((p) => p.id)).toEqual(['p2', 'p1']);
  });

  it('logs out when the API answers 401, and clears posts on logout', async () => {
    vi.stubGlobal('fetch', () => json({ message: 'Unauthorized' }, 401));
    await usePosts.getState().load();
    expect(useSession.getState().status).toBe('anon');
    expect(usePosts.getState().posts).toEqual([]);
  });
});
