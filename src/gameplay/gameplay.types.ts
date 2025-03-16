import { Field, InputType, Int, ObjectType } from "@nestjs/graphql"
import { IsInt } from "class-validator"

export interface Position {
    x: number
    y: number
}

@InputType()
export class PositionInput implements Position {
    @IsInt()
    @Field(() => Int)
        x: number

    @IsInt()
    @Field(() => Int)
        y: number
}

@ObjectType()
export class PositionOutput implements Position {
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