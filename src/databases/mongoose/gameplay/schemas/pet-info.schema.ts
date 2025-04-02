import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"

@ObjectType({
    description: "The schema for pet info"
})
@Schema({ timestamps: true, autoCreate: false })
export class PetInfoSchema extends AbstractSchema {
    @Field(() => Int, {
        description: "The count of help of the pet",
    })
    @Prop({ type: Number, default: 0 })
        helpedCount: number
}

export const PetInfoSchemaClass = SchemaFactory.createForClass(PetInfoSchema)
