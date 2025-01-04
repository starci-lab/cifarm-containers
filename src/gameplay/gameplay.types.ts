import { Field, Int, ObjectType } from "@nestjs/graphql"
import { ApiProperty } from "@nestjs/swagger"
import { IsInt } from "class-validator"

@ObjectType()
export class Position {
    @Field(() => Int)
    @IsInt()
    @ApiProperty({ example: 1, description: "X coordinate" })
        x: number

    @Field(() => Int)
    @ApiProperty({ example: 1, description: "Y coordinate" })
        y: number
}