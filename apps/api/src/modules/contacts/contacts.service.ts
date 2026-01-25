import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactInput } from './dto/create-contact.input';
import { UpdateContactInput } from './dto/update-contact.input';
import { splitName } from '../../common/utils/string.utils';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  create(createContactInput: CreateContactInput, userId: string) {
    const { name, ...rest } = createContactInput;
    const { firstName, lastName } = splitName(name);

    return this.prisma.contact.create({
      data: {
        ...rest,
        firstName,
        lastName,
        userId,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.contact.findMany({
      where: { userId },
      include: {
        transactions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: {
        transactions: true,
      },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    if (contact.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this contact',
      );
    }

    return contact;
  }

  async update(
    id: string,
    updateContactInput: UpdateContactInput,
    userId: string,
  ) {
    // Check existence and ownership
    await this.findOne(id, userId);

    const { name, email, phoneNumber } = updateContactInput;
    let nameData = {};
    if (name) {
      const { firstName, lastName } = splitName(name);
      nameData = { firstName, lastName };
    }

    return this.prisma.contact.update({
      where: { id },
      data: {
        ...nameData,
        ...(email !== undefined && { email }),
        ...(phoneNumber !== undefined && { phoneNumber }),
      },
    });
  }

  async remove(id: string, userId: string) {
    // Check existence and ownership
    await this.findOne(id, userId);

    return this.prisma.contact.delete({
      where: { id },
    });
  }

  async getBalance(contactId: string): Promise<number> {
    const aggregations = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        contactId,
        category: 'FUNDS',
      },
      _sum: {
        amount: true,
      },
    });

    let balance = 0;
    for (const agg of aggregations) {
      const amount = agg._sum.amount ? Number(agg._sum.amount) : 0;
      if (agg.type === 'GIVEN') {
        balance += amount;
      } else if (agg.type === 'RECEIVED' || agg.type === 'COLLECTED') {
        balance -= amount;
      }
    }

    return balance;
  }
}
