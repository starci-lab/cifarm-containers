import { Field, InputType, Int } from "@nestjs/graphql"
import { IsInt } from "class-validator"

@InputType()
export class PositionInput {
    @IsInt()
    @Field(() => Int)
        x: number

    @IsInt()
    @Field(() => Int)
        y: number
}

export interface GameplayOptions {
    theif?: TheifOptions
    loadStatic?: boolean
}

export interface TheifOptions {
    minQuantity?: number
    maxQuantity?: number
}