import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { KeyAbstractSchema } from "./abstract"
import { SupplyType } from "../enums"

// Mongoose document type
export type SupplyDocument = HydratedDocument<SupplySchema>;

@ObjectType()
@Schema({
    timestamps: true,
    collection: "supplies",
})
export class SupplySchema extends KeyAbstractSchema {
    @Field(() => String)
    @Prop({ type: String, required: true, enum: SupplyType })
        type: SupplyType

    @Field(() => Float)
    @Prop({ type: Number, required: true, default: 0 })
        price: number

    @Field(() => Boolean)
    @Prop({ type: Boolean, required: true, default: false })
        availableInShop: boolean

    @Field(() => Int, { nullable: true })
    @Prop({ type: Number, required: false })
        fertilizerEffectTimeReduce?: number
}

export const SupplySchemaClass = SchemaFactory.createForClass(SupplySchema)