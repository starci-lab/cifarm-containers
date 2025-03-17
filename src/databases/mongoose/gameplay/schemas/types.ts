import { Int, Field, ObjectType } from "@nestjs/graphql"

// interface for type checking
export interface KeyValueRecord<Value> {
    value: Value
}

@ObjectType()
export class Position {
    @Field(() => Int)
        x: number

    @Field(() => Int)
        y: number
}
