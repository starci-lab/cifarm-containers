import { Field, InputType, Int } from "@nestjs/graphql"
import { IsInt } from "class-validator"
import { BaseOptions } from "@src/common"

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

export interface GameplayOptions extends BaseOptions {
    theif?: TheifOptions
    loadStatic?: boolean
    loadLimit?: boolean
}

export interface TheifOptions {
    minQuantity?: number
    maxQuantity?: number
}