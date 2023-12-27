import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreatevideoCommand } from './command/create-video.command';
import { Video } from './entity/video.entity';
import { User } from 'src/user/entity/user.entity';
import { VideoCreatedEvent } from './event/video-created.event';

@Injectable()
@CommandHandler(CreatevideoCommand)
export class CreateVideoHandler implements ICommandHandler<CreatevideoCommand> {
  constructor(private readonly dataSource: DataSource, private readonly eventBus: EventBus) {}
  async execute(command: CreatevideoCommand): Promise<Video> {
    const { userId, title, mimetype, extension, buffer } = command;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    let error = null;

    try {
      const user = await queryRunner.manager.findOneBy(User, { id: userId });
      const video = await queryRunner.manager.save(queryRunner.manager.create(Video, { title, mimetype, user }));
      await this.uploadVideo(video.id, extension, buffer);
      await queryRunner.commitTransaction();
      this.eventBus.publish(new VideoCreatedEvent(video.id));
      return video;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }
  private async uploadVideo(id: string, extension: string, buffer: Buffer) {
    console.log('upload video');
  }
}
