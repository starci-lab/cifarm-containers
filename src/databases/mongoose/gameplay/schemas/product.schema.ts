import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { ProductId, ProductType } from "../enums"
import { StaticAbstractSchema } from "./abstract"
import { Schema as MongooseSchema } from "mongoose"
import { CropSchema } from "./crop.schema"
import { AnimalSchema } from "./animal.schema"
import { FruitSchema } from "./fruit.schema"

@ObjectType()
@Schema({ timestamps: true, collection: "products" })
export class ProductSchema extends StaticAbstractSchema<ProductId> {
    @Field(() => Int)
    @Prop({ type: Number, required: true })
        maxStack: number

    @Field(() => Boolean)
    @Prop({ type: Boolean, required: true })
        isQuality: boolean

    @Field(() => Int)
    @Prop({ type: Number, required: true })
        goldAmount: number

    @Field(() => Float, { nullable: true })
    @Prop({ type: Number, required: false })
        tokenAmount?: number

    @Field(() => String)
    @Prop({ type: String, enum: ProductType, required: true })
        type: ProductType

    @Field(() => ID, { nullable: true })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: CropSchema.name })
        crop: CropSchema | string
        
    @Field(() => ID, { nullable: true })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: AnimalSchema.name })
        animal: AnimalSchema | string

    @Field(() => ID, { nullable: true })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: FruitSchema.name })
        fruit: FruitSchema | string
}

// Generate Mongoose Schema
export const ProductSchemaClass = SchemaFactory.createForClass(ProductSchema)
