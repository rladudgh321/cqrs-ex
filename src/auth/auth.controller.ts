import { Controller, Post, Body, BadRequestException, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { SigninReqDto, SignupReqDto } from './dto/req.dto';
import { RefreshResDto, SigninResDto, SignupResDto } from './dto/res.dto';
import { ApiPostResponse } from 'src/common/decorators/swagger.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { User, UserAfterAuth } from 'src/common/decorators/user.decorator';

@ApiTags('Auth')
@ApiExtraModels(SigninResDto, SignupResDto)
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiPostResponse(SignupResDto)
  @Post('signup')
  @Public()
  async signup(@Body() { email, password, passwordConfirm }: SignupReqDto): Promise<SignupResDto> {
    if (password !== passwordConfirm) throw new BadRequestException();
    const { id, accessToken, refreshToken } = await this.authService.signup(email, password);
    return { id, accessToken, refreshToken };
  }

  @ApiPostResponse(SigninResDto)
  @Post('signin')
  @Public()
  async signin(@Body() { email, password }: SigninReqDto) {
    return this.authService.signin(email, password);
  }

  @ApiPostResponse(RefreshResDto)
  @ApiBearerAuth()
  @Post('refresh')
  async refresh(@Headers('authorization') authorization, @User() user: UserAfterAuth) {
    const token = /Bearer\s(.+)/.exec(authorization)[1];
    const { accessToken, refreshToken } = await this.authService.refresh(token, user.id);
    return { accessToken, refreshToken };
  }
}
