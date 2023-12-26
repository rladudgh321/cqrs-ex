import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class PageResDto<TData> {
  @ApiProperty({ required: true })
  @IsNumber()
  page: number;

  @ApiProperty({ required: true })
  @IsNumber()
  size: number;

  @ApiProperty({ required: true })
  items: TData[];
}
