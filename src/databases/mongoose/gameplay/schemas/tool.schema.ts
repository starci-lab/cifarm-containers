import { Field, Int, ObjectType } from "@nestjs/graphql"
import { CacheControl } from "@src/decorators"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { AvailableInType } from "../enums"
import { KeyAbstractSchema } from "./abstract"

// Mongoose document type
export type ToolDocument = HydratedDocument<ToolSchema>;

@CacheControl({ maxAge: 100 })
@ObjectType()
@Schema({ timestamps: true, collection: "tools", id: false })
export class ToolSchema extends KeyAbstractSchema {
    
    @Field(() => String)
    @CacheControl({ maxAge: 100 })
    @Prop({ type: String, enum: AvailableInType, required: true })
        availableIn: AvailableInType
    
    @Field(() => Int)
    @CacheControl({ maxAge: 100 })
    @Prop({ type: Number, required: true })
        index: number
}

// Generate Mongoose Schema
export const ToolSchemaClass = SchemaFactory.createForClass(ToolSchema)
