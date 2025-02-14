import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { StaticAbstractSchema } from "./abstract"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AvailableInType, InventoryType } from "../enums"
import { CropSchema } from "./crop.schema"
import { Schema as MongooseSchema } from "mongoose"
import { ProductSchema } from "./product.schema"
import { ToolSchema } from "./tool.schema"
import { SupplySchema } from "./supply.schema"

@ObjectType()
@Schema({
    timestamps: true,
    collection: "inventory-types"
})
export class InventoryTypeSchema extends StaticAbstractSchema {
    @Field(() => String)
    @Prop({ type: String, required: true, enum: InventoryType })
        type: InventoryType

    @Field(() => ID, { nullable: true })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: CropSchema.name })
        crop: CropSchema | string
    
    @Field(() => ID, { nullable: true })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: ProductSchema.name })
        product: ProductSchema | string

    @Field(() => ID, { nullable: true })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: ToolSchema.name })
        tool: ToolSchema | string

    @Field(() => ID, { nullable: true })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: SupplySchema.name })
        supply: SupplySchema | string

    @Field(() => Boolean)
    @Prop({ type: Boolean, required: true })
        placeable: boolean

    @Field(() => Boolean)
    @Prop({ type: Boolean, required: true })
        deliverable: boolean

    @Field(() => Boolean)
    @Prop({ type: Boolean, required: true })
        asTool: boolean

    @Field(() => String, { nullable: true })
    @Prop({ type: String, required: false, enum: AvailableInType })
        availableIn?: AvailableInType

    @Field(() => Boolean)
    @Prop({ type: Boolean, required: true, default: true })
        stackable: boolean

    @Field(() => Int, { nullable: true })
        @Prop({ type: Number, required: false, min: 1 })
        maxStack?: number
}

export const InventoryTypeSchemaClass = SchemaFactory.createForClass(InventoryTypeSchema)