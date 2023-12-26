import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { VideoService } from './video.service';
import { CreateVideoResDto, FindVideoResDto } from './dto/res.dto';
import { ApiGetItemsResponse, ApiGetResponse, ApiPostResponse } from 'src/common/decorators/swagger.decorator';
import { CreateVideoReqDto, FindVideoReqDto } from './dto/req.dto';
import { PageReqDto } from 'src/common/dto/req.dto';
import { ThrottlerBehindProxyGuard } from 'src/common/guard/throttler-behind-proxy.guard';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@ApiTags('Video')
@ApiExtraModels(CreateVideoResDto, FindVideoResDto)
@UseGuards(ThrottlerBehindProxyGuard)
@Controller('api/videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @ApiBearerAuth()
  @ApiPostResponse(CreateVideoResDto)
  @Post()
  upload(@Body() { title, video }: CreateVideoReqDto) {
    return this.videoService.create();
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
