import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { Contact } from './entities/contact.entity';
import { CreateContactInput } from './dto/create-contact.input';
import { UpdateContactInput } from './dto/update-contact.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Contact)
@UseGuards(GqlAuthGuard)
export class ContactsResolver {
  constructor(private readonly contactsService: ContactsService) {}

  @Mutation(() => Contact)
  createContact(
    @Args('createContactInput') createContactInput: CreateContactInput,
    @CurrentUser() user: User,
  ) {
    return this.contactsService.create(createContactInput, user.id);
  }

  @Query(() => [Contact], { name: 'contacts' })
  findAll(@CurrentUser() user: User) {
    return this.contactsService.findAll(user.id);
  }

  @Query(() => Contact, { name: 'contact' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.contactsService.findOne(id, user.id);
  }

  @ResolveField(() => Number)
  async balance(@Parent() contact: Contact) {
    return this.contactsService.getBalance(contact.id);
  }

  @Mutation(() => Contact)
  updateContact(
    @Args('updateContactInput') updateContactInput: UpdateContactInput,
    @CurrentUser() user: User,
  ) {
    return this.contactsService.update(
      updateContactInput.id,
      updateContactInput,
      user.id,
    );
  }

  @Mutation(() => Contact)
  removeContact(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.contactsService.remove(id, user.id);
  }
}
