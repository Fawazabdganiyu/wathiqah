import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

@InputType()
export class WitnessInviteInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
