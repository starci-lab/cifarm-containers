import { ObjectType, Field, Int } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { AbstractSchema } from "./abstract"

// Mongoose document type
export type UpgradeDocument = HydratedDocument<UpgradeSchema>;

@ObjectType()
@Schema({
    timestamps: true,
    autoCreate: false 
})
export class UpgradeSchema extends AbstractSchema {
    @Field(() => Int, { nullable: true })
    @Prop({ type: Number, required: false })
        upgradePrice?: number
    
    @Field(() => Int)
    @Prop({ type: Number, required: true })
        capacity: number
    
    @Field(() => Int)
    @Prop({ type: Number, required: true })
        upgradeLevel: number
}

// Generate Mongoose Schema
export const UpgradeSchemaClass = SchemaFactory.createForClass(UpgradeSchema)
