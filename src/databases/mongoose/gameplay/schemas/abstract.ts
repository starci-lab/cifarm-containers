import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Prop } from "@nestjs/mongoose"
import { Document } from "mongoose"

@ObjectType({
    isAbstract: true,
    description: "The abstract schema for all objects"
})
export abstract class AbstractSchema extends Document {
    // field to use graphql
    @Field(() => ID, {
        description: "The ID of the object"
    })
        id: string

    @Prop()
    @Field(() => Date, {
        description: "The date the object was created"

    })
        createdAt: Date

    @Prop()
    @Field(() => Date, {
        description: "The date the object was updated"
    })
        updatedAt: Date
}