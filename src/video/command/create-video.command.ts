import { ICommand } from '@nestjs/cqrs';

export class CreatevideoCommand implements ICommand {
  constructor(
    readonly userId: string,
    readonly title: string,
    readonly mimetype: string,
    readonly extension: string,
    readonly buffer: Buffer,
  ) {}
}
