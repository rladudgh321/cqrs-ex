import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { Role } from './enum/user.enum';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async findAll(page: number, size: number) {
    return this.userRepository.find({
      skip: (page - 1) * size,
      take: size,
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new BadRequestException();
    return user;
  }

  async create(email: string, password: string) {
    const user = this.userRepository.create({ email, password });
    await this.userRepository.save(user);
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    return user;
  }

  async checkAdminUser(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    return user.role === Role.Admin;
  }
}
