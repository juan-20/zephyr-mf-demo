export type User = {
  id: string;
  username: string;
};

export type Post = {
  id: string;
  author: User;
  content: string;
  createdAt: string; // ISO 8601
  likeCount: number;
  likedByMe: boolean;
};

export type LoginRequest = { username: string; password: string };
export type CreatePostRequest = { content: string };
