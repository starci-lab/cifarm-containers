import { Field, Int, ObjectType } from "@nestjs/graphql"
import { IsInt } from "class-validator"

@ObjectType()
export class Position {
    @IsInt()
    @Field(() => Int)
        x: number

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