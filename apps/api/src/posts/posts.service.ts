import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { Post } from '@repo/types';
import { LikeEntity, PostEntity, UserEntity } from '../entities';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity) private readonly posts: Repository<PostEntity>,
    @InjectRepository(LikeEntity) private readonly likes: Repository<LikeEntity>,
  ) {}

  private async toViews(posts: PostEntity[], userId: string): Promise<Post[]> {
    if (posts.length === 0) return [];
    const ids = posts.map((p) => p.id);
    const counts = await this.likes
      .createQueryBuilder('l')
      .select('l.postId', 'postId')
      .addSelect('COUNT(*)', 'count')
      .where('l.postId IN (:...ids)', { ids })
      .groupBy('l.postId')
      .getRawMany<{ postId: string; count: string }>();
    const mine = await this.likes.find({ where: { userId, postId: In(ids) } });
    const countById = new Map(counts.map((c) => [c.postId, Number(c.count)]));
    const likedIds = new Set(mine.map((l) => l.postId));
    return posts.map((p) => ({
      id: p.id,
      author: { id: p.author.id, username: p.author.username },
      content: p.content,
      createdAt: p.createdAt,
      likeCount: countById.get(p.id) ?? 0,
      likedByMe: likedIds.has(p.id),
    }));
  }

  async feed(userId: string): Promise<Post[]> {
    const posts = await this.posts.find({ order: { createdAt: 'DESC' }, take: 50 });
    return this.toViews(posts, userId);
  }

  async create(userId: string, content: string): Promise<Post> {
    const post = await this.posts.save(
      this.posts.create({
        content,
        createdAt: new Date().toISOString(),
        author: { id: userId } as UserEntity,
      }),
    );
    return this.one(post.id, userId);
  }

  private async one(postId: string, userId: string): Promise<Post> {
    const post = await this.posts.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    return (await this.toViews([post], userId))[0];
  }

  // Like and unlike are idempotent, so repeating them never changes the count twice.
  async like(postId: string, userId: string): Promise<Post> {
    await this.one(postId, userId);
    await this.likes.upsert({ userId, postId }, ['userId', 'postId']);
    return this.one(postId, userId);
  }

  async unlike(postId: string, userId: string): Promise<Post> {
    await this.one(postId, userId);
    await this.likes.delete({ userId, postId });
    return this.one(postId, userId);
  }
}
