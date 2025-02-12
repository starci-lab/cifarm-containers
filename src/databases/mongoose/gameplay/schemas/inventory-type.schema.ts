import { Field, Int, ObjectType } from "@nestjs/graphql"
import { HydratedDocument } from "mongoose"
import { KeyAbstractSchema } from "./abstract"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AvailableInType, InventoryType } from "../enums"

export type InventoryTypeDocument = HydratedDocument<InventoryTypeSchema>

@ObjectType()
@Schema({
    timestamps: true,
    collection: "inventory-types",
    _id: false
})
export class InventoryTypeSchema extends KeyAbstractSchema {
    @Field(() => String)
    @Prop({ type: String, required: true, enum: InventoryType })
        type: InventoryType

    @Field(() => String)
    @Prop({ type: String, required: true })
        refKey: string

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

    @Field(() => Int)
        @Prop({ type: Number, required: true, min: 1 })
        maxStack: number
}

export const InventoryTypeSchemaClass = SchemaFactory.createForClass(InventoryTypeSchema)