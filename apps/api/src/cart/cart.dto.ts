import { IsInt, IsPositive, IsString, Min } from 'class-validator';
export class AddCartItemDto { @IsString() productId!: string; @IsInt() @IsPositive() quantity!: number; }
export class UpdateCartItemDto { @IsInt() @Min(0) quantity!: number; }
