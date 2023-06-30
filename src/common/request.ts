import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class IdDto {
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  readonly id: number;
}
