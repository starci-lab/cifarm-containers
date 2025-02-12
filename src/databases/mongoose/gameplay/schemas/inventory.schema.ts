import { Field, Int, ObjectType } from "@nestjs/graphql"
import { HydratedDocument } from "mongoose"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"

export type InventoryDocument = HydratedDocument<InventorySchema>

@ObjectType()
@Schema({
    timestamps: true,
    collection: "inventories"
})
export class InventorySchema extends AbstractSchema {
    @Field(() => String)
    @Prop({ type: Number, required: true })
        quantity: number

    @Field(() => String, { nullable: true })
    @Prop({ type: String, required: false })
        tokenId?: string

    @Field(() => String)
    @Prop({ type: String, required: true })
        userId: string
    
    @Field(() => Boolean, { nullable: true })
    @Prop({ type: Boolean, required: true })
        inToolbar?: boolean

    @Field(() => Int, { nullable: true })
    @Prop({ type: Number, required: false })
        toolbarIndex?: string
    
    @Field(() => Int, { nullable: true })
    @Prop({ type: Number, required: false })
        inventoryIndex?: number

    @Field(() => String)
    @Prop({ type: String, required: true })
        inventoryTypeKey: string
}

export const InventorySchemaClass = SchemaFactory.createForClass(InventorySchema)