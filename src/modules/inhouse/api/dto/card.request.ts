import { CardCompany } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  CardCreateRequest,
  CardListQuery,
  CardUpdateRequest,
} from 'src/@shared/api/inhouse/card.request';
import { IsName } from 'src/validator/is-name.validator';
import { IsOnlyNumber } from 'src/validator/is-only-number';

export class CardListDto implements CardListQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  readonly skip: number = 0;

  @ValidateIf((obj, val) => val !== undefined)
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(10)
  @Max(100)
  readonly take: number = undefined;
}

export class CardCreateRequestDto implements CardCreateRequest {
  @IsEnum(CardCompany)
  readonly cardCompany: CardCompany;

  @IsString()
  @IsName()
  @Length(1, 150)
  readonly cardName: string;

  @IsString()
  @IsOnlyNumber()
  @Length(4, 4)
  readonly cardNumber: string;

  @IsString()
  @IsName()
  @Length(1, 150)
  readonly cardHolder: string;
}

export class CardUpdateRequestDto implements CardUpdateRequest {
  @IsString()
  @IsName()
  @Length(1, 150)
  readonly cardName: string;
}
