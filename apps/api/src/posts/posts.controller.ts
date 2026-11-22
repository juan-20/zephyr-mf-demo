import { Body, Controller, Delete, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthedRequest, JwtAuthGuard } from '../auth/auth.guard';
import { CreatePostDto } from './posts.dto';
import { PostsService } from './posts.service';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  feed(@Req() req: AuthedRequest) {
    return this.posts.feed(req.user.sub);
  }

  @Post()
  create(@Req() req: AuthedRequest, @Body() dto: CreatePostDto) {
    return this.posts.create(req.user.sub, dto.content);
  }

  @Post(':id/like')
  @HttpCode(200)
  like(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.posts.like(id, req.user.sub);
  }

  @Delete(':id/like')
  unlike(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.posts.unlike(id, req.user.sub);
  }
}
