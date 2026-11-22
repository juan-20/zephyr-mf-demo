import { useEffect } from 'react';
import { usePosts } from '@repo/store';
import type { Post } from '@repo/types';
import { Avatar, HeartIcon, Panel } from '@repo/ui';

function PostItem({ post, onLike }: { post: Post; onLike: () => void }) {
  return (
    <li>
      <Panel>
        <article className="post">
          <header className="post__head">
            <Avatar name={post.author.username} />
            <div>
              <div className="post__author">{post.author.username}</div>
              <time className="post__time" dateTime={post.createdAt}>
                {new Date(post.createdAt).toLocaleString()}
              </time>
            </div>
          </header>
          <p className="post__body">{post.content}</p>
          <button className="like" onClick={onLike} aria-pressed={post.likedByMe}>
            <HeartIcon filled={post.likedByMe} />
            <span>{post.likeCount}</span>
            <span className="sr-only">{post.likedByMe ? 'Unlike' : 'Like'}</span>
          </button>
        </article>
      </Panel>
    </li>
  );
}

export default function Feed() {
  const { posts, loading, error, load, toggleLike } = usePosts();

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && posts.length === 0) return <p className="loading" aria-busy="true">Loading posts…</p>;

  return (
    <div className="stack">
      {error && (
        <div role="alert" className="alert">
          <strong>Couldn't load the feed</strong>
          <p>{error}</p>
          <button className="btn btn--ghost" onClick={() => void load()}>
            Retry
          </button>
        </div>
      )}
      {posts.length === 0 && !error ? (
        <p className="empty">No posts yet. Write the first one!</p>
      ) : (
        <ul className="list">
          {posts.map((p) => (
            <PostItem key={p.id} post={p} onLike={() => void toggleLike(p.id)} />
          ))}
        </ul>
      )}
    </div>
  );
}
