import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { name: 'me' })
  @UseGuards(GqlAuthGuard)
  getMe(@CurrentUser() user: User) {
    return user;
  }

  @Query(() => User, { name: 'user', nullable: true })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.usersService.findOne(id);
  }
}
