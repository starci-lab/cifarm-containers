import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { StaticAbstractSchema } from "./abstract"
import { SupplyId, SupplyType } from "../enums"

@ObjectType({
    description: "The schema for supplies that can be used on the farm"
})
@Schema({
    timestamps: true,
    collection: "supplies",
})
export class SupplySchema extends StaticAbstractSchema<SupplyId> {
    @Field(() => String, {
        description: "The type of supply"
    })
    @Prop({ type: String, required: true, enum: SupplyType })
        type: SupplyType

    @Field(() => Float, {
        description: "The price of the supply"
    })
    @Prop({ type: Number, required: true, default: 0 })
        price: number

    @Field(() => Boolean, {
        description: "Whether the supply is available in the shop"
    })
    @Prop({ type: Boolean, required: true, default: false })
        availableInShop: boolean

    @Field(() => Int, { 
        nullable: true,
        description: "The amount of time reduction effect for fertilizer supplies"
    })
    @Prop({ type: Number, required: false })
        fertilizerEffectTimeReduce?: number

    @Field(() => Int, { 
        nullable: true,
        description: "The level required to unlock this supply"
    })
    @Prop({ type: Number, required: false })
        unlockLevel?: number
}

export const SupplySchemaClass = SchemaFactory.createForClass(SupplySchema)