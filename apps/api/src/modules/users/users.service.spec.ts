import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchWitness', () => {
    it('should return masked user for valid email search', async () => {
      const mockUser = {
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        isEmailVerified: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.searchWitness('john@example.com', 'EMAIL');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
        select: expect.any(Object),
      });
      expect(result).toEqual({
        id: '123',
        firstName: 'J***',
        lastName: 'D***',
      });
    });

    it('should return masked user for valid phone search', async () => {
      const mockUser = {
        id: '456',
        firstName: 'Alice',
        lastName: 'Smith',
        isEmailVerified: true,
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.searchWitness('+1234567890', 'PHONE');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { phoneNumber: '+1234567890' },
        select: expect.any(Object),
      });
      expect(result).toEqual({
        id: '456',
        firstName: 'A***',
        lastName: 'S***',
      });
    });

    it('should return null if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.searchWitness(
        'unknown@example.com',
        'EMAIL',
      );

      expect(result).toBeNull();
    });

    it('should handle single character names correctly in masking', async () => {
      const mockUser = {
        id: '789',
        firstName: 'B',
        lastName: 'C',
        isEmailVerified: true,
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.searchWitness('b@example.com', 'EMAIL');

      expect(result).toEqual({
        id: '789',
        firstName: 'B***',
        lastName: 'C***',
      });
    });
  });
});
