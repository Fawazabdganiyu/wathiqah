import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

export enum SearchType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
}

registerEnumType(SearchType, {
  name: 'SearchType',
});

@InputType()
export class SearchWitnessInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  query: string;

  @Field(() => SearchType)
  @IsNotEmpty()
  type: SearchType;
}
