import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class InviteContactResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

@ObjectType()
export class ContactPlatformStatus {
  @Field()
  isOnPlatform: boolean;

  @Field({ nullable: true })
  linkedUserId?: string;
}
