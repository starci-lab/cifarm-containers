import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { StaticAbstractSchema } from "./abstract"

@ObjectType()
@Schema({ timestamps: true, collection: "tools" })
export class ToolSchema extends StaticAbstractSchema {
    @Field(() => Int)
    @Prop({ type: Number, required: true })
        sort: number
    @Field(() => Boolean)
    @Prop({ type: Boolean, required: true, default: false })
        default: boolean
}

// Generate Mongoose Schema
export const ToolSchemaClass = SchemaFactory.createForClass(ToolSchema)
