import { Field, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { KeyValueStoreId, GraphQLTypeKeyValueStoreId } from "../enums"

@ObjectType({
    description: "The key value store schema"
})
@Schema({
    timestamps: true,
    collection: "key-value-stores",
})
export class KeyValueStoreSchema extends AbstractSchema {
    @Field(() => GraphQLTypeKeyValueStoreId, {
        description: "The display ID of the key value store"
    })
    @Prop({ type: String, enum: KeyValueStoreId, required: true, unique: true })
        displayId: KeyValueStoreId

    @Field(() => Object, {
        description: "The value stored for this key"
    })
    @Prop({ type: Object, required: true })
        value: object
}

// Generate Mongoose Schema
export const KeyValueStoreSchemaClass = SchemaFactory.createForClass(KeyValueStoreSchema)

// Class for KeyValueStoreSchema
@ObjectType({
    description: "Schedule information for animal growth"
})
export class AnimalLastSchedule {
    @Field(() => Date, {
        description: "The date of the last animal growth schedule"
    })
        date: Date
}

@ObjectType({
    description: "Schedule information for fruit growth"
})
export class FruitLastSchedule {
    @Field(() => Date, {
        description: "The date of the last fruit growth schedule"
    })
        date: Date
}

@ObjectType({
    description: "Schedule information for energy regeneration"
})
export class EnergyRegenerationLastSchedule {
    @Field(() => Date, {
        description: "The date of the last energy regeneration schedule"
    })
        date: Date
}

@ObjectType({
    description: "Schedule information for bee house growth"
})
export class BeeHouseLastSchedule {
    @Field(() => Date, {
        description: "The date of the last bee house growth schedule"
    })
        date: Date
}

@ObjectType({
    description: "Schedule information for plant growth"
})
export class PlantLastSchedule {
    @Field(() => Date, {
        description: "The date of the last plant growth schedule"
    })
        date: Date
}

