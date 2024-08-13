import { IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export default class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @ApiPropertyOptional()
  page?: number = 1;
}
