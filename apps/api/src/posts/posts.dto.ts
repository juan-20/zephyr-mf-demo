import { IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePostDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 280)
  content!: string;
}
