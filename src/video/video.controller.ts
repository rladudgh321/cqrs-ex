import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { VideoService } from './video.service';
import { CreateVideoResDto, FindVideoResDto } from './dto/res.dto';
import { ApiGetItemsResponse, ApiGetResponse, ApiPostResponse } from 'src/common/decorators/swagger.decorator';
import { CreateVideoReqDto, FindVideoReqDto } from './dto/req.dto';
import { PageReqDto } from 'src/common/dto/req.dto';
import { ThrottlerBehindProxyGuard } from 'src/common/guard/throttler-behind-proxy.guard';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { User, UserAfterAuth } from 'src/common/decorators/user.decorator';
import { CreatevideoCommand } from './command/create-video.command';
import { CommandBus } from '@nestjs/cqrs';

@ApiTags('Video')
@ApiExtraModels(CreateVideoResDto, FindVideoResDto)
@UseGuards(ThrottlerBehindProxyGuard)
@Controller('api/videos')
export class VideoController {
  constructor(private readonly videoService: VideoService, private readonly commandBus: CommandBus) {}

  @ApiBearerAuth()
  @ApiPostResponse(CreateVideoResDto)
  @Post()
  async upload(@Body() { title, video }: CreateVideoReqDto, @User() user: UserAfterAuth): Promise<CreateVideoResDto> {
    const command = new CreatevideoCommand(user.id, title, 'video/mp4', 'mp4', Buffer.from(''));
    const { id } = await this.commandBus.execute(command);
    return { id, title };
  }

  @ApiBearerAuth()
  @ApiGetItemsResponse(FindVideoResDto)
  @SkipThrottle()
  @Get()
  findAll(@Query() { page, size }: PageReqDto) {
    return this.videoService.findAll();
  }

  @ApiBearerAuth()
  @ApiGetResponse(FindVideoResDto)
  @Get(':id')
  findOne(@Param() { id }: FindVideoReqDto) {
    return this.videoService.findOne(id);
  }

  @ApiBearerAuth()
  @Throttle({ default: { limit: 3, ttl: 60 * 1000 } })
  @Get(':id/download')
  async download(@Param() { id }: FindVideoReqDto) {
    return this.videoService.download(id);
  }
}
