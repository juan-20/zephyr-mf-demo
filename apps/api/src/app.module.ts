import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { HealthController } from './health.controller';
import { LikeEntity, PostEntity, UserEntity } from './entities';

const entities = [UserEntity, PostEntity, LikeEntity];

@Module({
  imports: [
    TypeOrmModule.forRoot(
      process.env.DATABASE_URL
        ? {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
            entities,
            synchronize: true, // demo only: use migrations in a real product
          }
        : {
            type: 'better-sqlite3',
            database: process.env.SQLITE_PATH ?? 'dev.sqlite',
            entities,
            synchronize: true,
          },
    ),
    AuthModule,
    PostsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
