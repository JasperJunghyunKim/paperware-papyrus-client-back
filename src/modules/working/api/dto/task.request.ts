import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import {
  TaskCreateConvertingRequest,
  TaskCreateGuillotineRequest,
  TaskCreateQuantityRequest,
  TaskUpdateConvertingRequest,
  TaskUpdateGuillotineRequest,
  TaskUpdateQuantityRequest,
} from 'src/@shared/api/working/task.request';

export class TaskCreateConvertingRequestDto
  implements TaskCreateConvertingRequest
{
  @IsInt()
  @Type(() => Number)
  readonly planId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly parentTaskId: number = null;

  @IsInt()
  @Type(() => Number)
  readonly sizeX: number;

  @IsInt()
  @Type(() => Number)
  readonly sizeY: number;

  @IsOptional()
  @Type(() => String)
  readonly memo: string = '';
}

export class TaskCreateGuillotineRequestDto
  implements TaskCreateGuillotineRequest
{
  @IsInt()
  @Type(() => Number)
  readonly planId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly parentTaskId: number = null;

  @IsInt()
  @Type(() => Number)
  readonly sizeX: number;

  @IsInt()
  @Type(() => Number)
  readonly sizeY: number;

  @IsOptional()
  @Type(() => String)
  readonly memo: string = '';
}

export class TaskCreateQuantityRequestDto implements TaskCreateQuantityRequest {
  @IsInt()
  @Type(() => Number)
  readonly planId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly parentTaskId: number = null;

  @IsInt()
  @Type(() => Number)
  readonly quantity: number;
}

export class TaskUpdateConvertingRequestDto
  implements TaskUpdateConvertingRequest
{
  @IsInt()
  @Type(() => Number)
  readonly sizeX: number;

  @IsInt()
  @Type(() => Number)
  readonly sizeY: number;

  @IsOptional()
  @Type(() => String)
  readonly memo: string = '';
}

export class TaskUpdateGuillotineRequestDto
  implements TaskUpdateGuillotineRequest
{
  @IsInt()
  @Type(() => Number)
  readonly sizeX: number;

  @IsInt()
  @Type(() => Number)
  readonly sizeY: number;

  @IsOptional()
  @Type(() => String)
  readonly memo: string = '';
}

export class TaskUpdateQuantityRequestDto implements TaskUpdateQuantityRequest {
  @IsInt()
  @Type(() => Number)
  readonly quantity: number;
}
