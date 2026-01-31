import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class RefreshTokenInput {
  @Field({ nullable: true })
  @IsString()
  refreshToken?: string;
}
