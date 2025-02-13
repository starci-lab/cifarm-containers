import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { HydratedDocument, Schema as MongooseSchema } from "mongoose"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { UserSchema } from "./user.schema"

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

    @Field(() => ID)
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserSchema.name })
        user: UserSchema | string
    
    @Field(() => Boolean, { nullable: true })
    @Prop({ type: Boolean, required: false })
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