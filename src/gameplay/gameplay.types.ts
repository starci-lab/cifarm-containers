import { Field, InputType, Int } from "@nestjs/graphql"
import { IsInt } from "class-validator"

@InputType({
    description: "A position in the game"
})
export class PositionInput {
    @IsInt()
    @Field(() => Int, {
        description: "The x coordinate of the position"
    })
        x: number

    @IsInt()
    @Field(() => Int, {
        description: "The y coordinate of the position"
    })
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