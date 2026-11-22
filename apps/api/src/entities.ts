import { Column, Entity, Index, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar', unique: true }) username!: string;
  @Column({ type: 'varchar' }) passwordHash!: string;
}

@Entity()
export class PostEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' }) author!: UserEntity;
  @Column({ type: 'varchar', length: 280 }) content!: string;
  // ISO 8601 string: sortable, millisecond precision, identical on SQLite and Postgres.
  @Index() @Column({ type: 'varchar' }) createdAt!: string;
}

@Entity()
export class LikeEntity {
  @PrimaryColumn({ type: 'varchar' }) userId!: string;
  @PrimaryColumn({ type: 'varchar' }) postId!: string;
}
