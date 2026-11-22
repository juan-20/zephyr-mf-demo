import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { LikeEntity, PostEntity } from '../entities';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, LikeEntity]), AuthModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
