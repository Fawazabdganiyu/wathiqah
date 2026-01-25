import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class WitnessCandidate {
  @Field(() => ID)
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  // We do not expose email or phone back to the requester to prevent enumeration/scraping
  // The requester already provided the search term (email/phone), so they know it.
  // But we mask the name to confirm identity without fully revealing it if they just guessed the email.
}
