import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
  @IsString() @IsNotEmpty() @MaxLength(120)
  slug!: string;

  @IsString() @IsNotEmpty() @MaxLength(160)
  name!: string;

  @IsString() @IsNotEmpty() @MaxLength(2000)
  description!: string;

  /** Price in the smallest currency unit (cents for EUR). */
  @Type(() => Number) @IsInt() @Min(0)
  price!: number;

  @IsString() @Matches(/^[A-Za-z]{3}$/)
  currency = 'EUR';

  @IsString() @IsNotEmpty() @MaxLength(2000) @IsUrl({ require_protocol: true, require_tld: false })
  imageUrl!: string;

  @IsString() @IsNotEmpty() @MaxLength(80)
  category!: string;

  @Type(() => Number) @IsInt() @Min(0)
  inventory!: number;

  @IsOptional() @Type(() => Boolean) @IsBoolean()
  active?: boolean;
}

export class UpdateProductDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(120)
  slug?: string;

  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(160)
  name?: string;

  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(2000)
  description?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  price?: number;

  @IsOptional() @IsString() @Matches(/^[A-Za-z]{3}$/)
  currency?: string;

  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(2000) @IsUrl({ require_protocol: true, require_tld: false })
  imageUrl?: string;

  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(80)
  category?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  inventory?: number;

  @IsOptional() @Type(() => Boolean) @IsBoolean()
  active?: boolean;
}
