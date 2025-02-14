import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AvailableInType } from "../enums"
import { StaticAbstractSchema } from "./abstract"

@ObjectType()
@Schema({ timestamps: true, collection: "tools" })
export class ToolSchema extends StaticAbstractSchema {
    
    @Field(() => String)
    @Prop({ type: String, enum: AvailableInType, required: true })
        availableIn: AvailableInType
    
    @Field(() => Int)
    @Prop({ type: Number, required: true })
        index: number
}

// Generate Mongoose Schema
export const ToolSchemaClass = SchemaFactory.createForClass(ToolSchema)
