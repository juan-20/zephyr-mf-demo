import { useEffect } from 'react';
import { usePosts } from '@repo/store';
import type { Post } from '@repo/types';
import { Panel } from '@repo/ui';

function PostItem({ post, onLike }: { post: Post; onLike: () => void }) {
  return (
    <li style={{ listStyle: 'none' }}>
      <Panel title={post.author.username}>
        <p style={{ whiteSpace: 'pre-wrap', margin: '0 0 8px' }}>{post.content}</p>
        <small style={{ opacity: 0.7 }}>{new Date(post.createdAt).toLocaleString()}</small>
        <div style={{ marginTop: 8 }}>
          <button onClick={onLike} aria-pressed={post.likedByMe}>
            {post.likedByMe ? '♥' : '♡'} {post.likeCount}
            <span style={{ position: 'absolute', left: -9999 }}>
              {post.likedByMe ? 'Unlike' : 'Like'}
            </span>
          </button>
        </div>
      </Panel>
    </li>
  );
}

export default function Feed() {
  const { posts, loading, error, load, toggleLike } = usePosts();

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && posts.length === 0) return <p aria-busy="true">Loading posts…</p>;

  return (
    <div>
      {error && (
        <p role="alert" style={{ color: '#c33' }}>
          {error} <button onClick={() => void load()}>Retry</button>
        </p>
      )}
      {posts.length === 0 && !error ? (
        <p>No posts yet. Write the first one!</p>
      ) : (
        <ul style={{ padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          {posts.map((p) => (
            <PostItem key={p.id} post={p} onLike={() => void toggleLike(p.id)} />
          ))}
        </ul>
      )}
    </div>
  );
}
