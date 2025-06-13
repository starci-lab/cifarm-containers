import { ObjectType } from "@nestjs/graphql"
import { Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"

@ObjectType({
    description: "The decoration info schema"
})
@Schema({ timestamps: true, autoCreate: true })
export class DecorationInfoSchema extends AbstractSchema {
}

// Generate Mongoose Schema
export const DecorationInfoSchemaClass = SchemaFactory.createForClass(DecorationInfoSchema)
