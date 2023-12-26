import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { RefreshToken } from './entity/refreshToken.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken) private readonly refreshRepository: Repository<RefreshToken>,
  ) {}

  async signup(email: string, password: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let error = null;
    try {
      const user = await this.userService.findOneByEmail(email);
      if (user) throw new BadRequestException();

      const saltRounds = 10;
      const hash = await bcrypt.hash(password, saltRounds);
      const userEntity = queryRunner.manager.create(User, {
        email,
        password: hash,
      });
      await queryRunner.manager.save(userEntity);

      const accessToken = this.generateAccessToken(userEntity.id);
      const refreshToken = this.generateRefreshToken(userEntity.id);
      const refreshEntity = queryRunner.manager.create(RefreshToken, {
        user: { id: userEntity.id },
        token: refreshToken,
      });
      await queryRunner.manager.save(refreshEntity);
      await queryRunner.commitTransaction();

      return { id: userEntity.id, accessToken, refreshToken };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      error = err;
    } finally {
      await queryRunner.release();
      if (error) {
        throw error;
      }
    }
  }

  async signin(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const refreshToken = this.generateRefreshToken(user.id);
    await this.createRefreshToken(user.id, refreshToken);
    return {
      accessToken: this.generateAccessToken(user.id),
      refreshToken,
    };
  }

  async refresh(token: string, userId: string) {
    const refreshTokenEntity = await this.refreshRepository.findOneBy({ token });
    if (!refreshTokenEntity) throw new BadRequestException();
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);
    refreshTokenEntity.token = refreshToken;
    await this.refreshRepository.save(refreshTokenEntity);
    return {
      accessToken,
      refreshToken,
    };
  }

  private generateAccessToken(userId: string) {
    const payload = { sub: userId, tokenType: 'access' };
    return this.jwtService.sign(payload, { expiresIn: '1d' });
  }

  private generateRefreshToken(userId: string) {
    const payload = { sub: userId, tokenType: 'refresh' };
    return this.jwtService.sign(payload, { expiresIn: '30d' });
  }
  private async createRefreshToken(userId: string, refreshToken: string) {
    let refreshTokenEntity = await this.refreshRepository.findOneBy({ user: { id: userId } });
    if (refreshTokenEntity) {
      refreshTokenEntity.token = refreshToken;
    } else {
      refreshTokenEntity = this.refreshRepository.create({ user: { id: userId }, token: refreshToken });
    }
    await this.refreshRepository.save(refreshTokenEntity);
  }

  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException();

    return user;
  }
}
