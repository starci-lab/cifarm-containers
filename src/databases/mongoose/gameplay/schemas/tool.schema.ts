import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { AvailableInType } from "../enums"
import { KeyAbstractSchema } from "./abstract"

// Mongoose document type
export type ToolDocument = HydratedDocument<ToolSchema>;

@ObjectType()
@Schema({ timestamps: true, collection: "tools" })
export class ToolSchema extends KeyAbstractSchema {
    
    @Field(() => String)
    @Prop({ type: String, enum: AvailableInType, required: true })
        availableIn: AvailableInType
    
    @Field(() => Int)
    @Prop({ type: Number, required: true })
        index: number
}

// Generate Mongoose Schema
export const ToolSchemaClass = SchemaFactory.createForClass(ToolSchema)
