import { Int, Field, ObjectType } from "@nestjs/graphql"

// interface for type checking
export interface KeyValueRecord<Value> {
    value: Value
}

@ObjectType({
    description: "A position in the game"
})
export class Position {
    @Field(() => Int, {
        description: "The x coordinate of the position"
    })
        x: number

    @Field(() => Int, {
        description: "The y coordinate of the position"
    })
        y: number
}
