import { IsInt } from "class-validator"

export class RetainProductMessage {
    @IsInt()
        index: number
} 