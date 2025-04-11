import { IsOptional, Min } from "class-validator"

export class UpdateSettingsMessage {
    @IsOptional()
    @Min(0)
        sound?: number
    @IsOptional()
    @Min(0)
        ambient?: number
}