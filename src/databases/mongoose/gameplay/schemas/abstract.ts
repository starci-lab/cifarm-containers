
import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Prop } from "@nestjs/mongoose"
import { Document } from "mongoose"

@ObjectType({
    isAbstract: true
})
export abstract class AbstractSchema extends Document {
    // field to use graphql
    @Field(() => ID)
        id: string

    @Field(() => Date)
    @Prop({ type: Date })
        createdAt: Date

    @Field(() => Date)
    @Prop({ type: Date })
        updatedAt: Date
}

@ObjectType({
    isAbstract: true
})
export abstract class StaticAbstractSchema extends AbstractSchema {
    @Field(() => ID)
    @Prop({ type: String, required: true, unique: true })
        displayId: string
}