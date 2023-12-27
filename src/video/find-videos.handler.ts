import { IQueryHandler } from '@nestjs/cqrs';
import { FindVideosQuery } from './query/find-videos.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Video } from './entity/video.entity';
import { Repository } from 'typeorm';

export class FindVideosQueryHandler implements IQueryHandler<FindVideosQuery> {
  constructor(@InjectRepository(Video) private readonly videoRepository: Repository<Video>) {}
  async execute({ page, size }: FindVideosQuery): Promise<any> {
    const video = await this.videoRepository.find({
      relations: ['user'],
      skip: (page - 1) * size,
      take: size,
    });
    return video;
  }
}
