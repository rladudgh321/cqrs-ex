import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { FindUserReqDto } from './dto/req.dto';
import { FindUserResDto } from './dto/res.dto';
import { ApiGetItemsResponse, ApiGetResponse } from 'src/common/decorators/swagger.decorator';
import { PageResDto } from 'src/common/dto/res.dto';
import { PageReqDto } from 'src/common/dto/req.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from './enum/user.enum';
import { User, UserAfterAuth } from 'src/common/decorators/user.decorator';

@ApiTags('User')
@ApiExtraModels(FindUserReqDto, FindUserResDto, PageResDto, PageReqDto)
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @ApiGetItemsResponse(FindUserResDto)
  @Roles(Role.Admin)
  @Get()
  async findAll(@Query() { page, size }: PageReqDto): Promise<FindUserReqDto[]> {
    console.log('findAll', page, size);
    throw new Error('server errror');
    const users = await this.userService.findAll(page, size);
    return users.map(({ id, email, createdAt }) => {
      return { id, email, createdAt: createdAt.toISOString() };
    });
  }

  @ApiBearerAuth()
  @ApiGetResponse(FindUserResDto)
  @Get(':id')
  findOne(@Param() { id }: FindUserReqDto) {
    return this.userService.findOne(id);
  }
}
