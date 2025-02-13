import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { Schema as MongooseSchema } from "mongoose"
import { UserSchema } from "./user.schema"
import { ProductKey } from "../enums"

@ObjectType()
@Schema({
    timestamps: true,
    collection: "delivering-product"
})
export class DeliveringProductSchema extends AbstractSchema {
    @Field(() => Int)
    @Prop({ type: Number, required: true })
        index: number

    @Field(() => Int)
    @Prop({ type: Number, required: true })
        quantity: number

    @Field(() => ID)
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserSchema.name })
        user: UserSchema | string

    @Field(() => String)
    @Prop({ type: String, enum: ProductKey, required: true })
        deliveringProductTypeKey: ProductKey
}

export const DeliveringProductSchemaClass = SchemaFactory.createForClass(DeliveringProductSchema)