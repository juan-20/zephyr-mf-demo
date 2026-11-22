import { IsString, Length, Matches } from 'class-validator';

export class CredentialsDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9_]{3,20}$/, { message: 'username must be 3-20 letters, digits or _' })
  username!: string;

  @IsString()
  @Length(8, 72)
  password!: string;
}
