import { create } from 'zustand';
import type { Post } from '@repo/types';
import { api, ApiError } from './api';
import { useSession } from './session';

type PostsState = {
  posts: Post[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  create: (content: string) => Promise<boolean>;
  toggleLike: (id: string) => Promise<void>;
};

const message = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');

// An expired or missing session reported by the API logs the user out everywhere.
function handleAuthError(e: unknown) {
  if (e instanceof ApiError && e.status === 401) {
    useSession.setState({ user: null, status: 'anon' });
  }
}

const pendingLikes = new Set<string>();

export const usePosts = create<PostsState>()((set, get) => ({
  posts: [],
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      set({ posts: await api<Post[]>('/posts'), loading: false });
    } catch (e) {
      handleAuthError(e);
      set({ loading: false, error: message(e) });
    }
  },

  create: async (content) => {
    try {
      const post = await api<Post>('/posts', { method: 'POST', body: JSON.stringify({ content }) });
      set((s) => ({ posts: [post, ...s.posts], error: null }));
      return true;
    } catch (e) {
      handleAuthError(e);
      set({ error: message(e) });
      return false;
    }
  },

  // Optimistic: the UI updates immediately and rolls back if the request fails.
  toggleLike: async (id) => {
    const before = get().posts.find((p) => p.id === id);
    if (!before || pendingLikes.has(id)) return;
    pendingLikes.add(id);
    const liking = !before.likedByMe;
    const replace = (next: Post) =>
      set((s) => ({ posts: s.posts.map((p) => (p.id === id ? next : p)) }));
    replace({ ...before, likedByMe: liking, likeCount: before.likeCount + (liking ? 1 : -1) });
    try {
      replace(await api<Post>(`/posts/${id}/like`, { method: liking ? 'POST' : 'DELETE' }));
    } catch (e) {
      handleAuthError(e);
      replace(before);
      set({ error: message(e) });
    } finally {
      pendingLikes.delete(id);
    }
  },
}));

// Never keep another user's feed around after logout.
useSession.subscribe((s) => {
  if (s.status === 'anon') usePosts.setState({ posts: [], error: null });
});
