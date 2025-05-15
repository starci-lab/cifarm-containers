import { IsOptional, IsString, Length } from "class-validator"

export class UpdateProfileMessage {
    @IsOptional()
    @IsString()
    @Length(1, 100)
        username?: string

    @IsOptional()
    @IsString()
    @Length(1, 255)
        avatarUrl?: string
}