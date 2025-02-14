import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { StaticAbstractSchema } from "./abstract"
import { SupplyType } from "../enums"

@ObjectType()
@Schema({
    timestamps: true,
    collection: "supplies",
})
export class SupplySchema extends StaticAbstractSchema {
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