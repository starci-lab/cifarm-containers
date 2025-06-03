import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { KeyValueStoreId, GraphQLTypeKeyValueStoreId } from "../enums"
import { Network } from "@src/env"

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

    // version to ensure the data is override or not
    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        version: number
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

@ObjectType({
    description: "Vault info"
})
export class VaultInfo {
    @Field(() => Float, {
        description: "The number of tokens locked in the vault",
        defaultValue: 0
    })
        tokenLocked: number
}

@ObjectType({
    description: "The vault infos"
})
export class VaultInfos {
    @Field(() => VaultInfo, {
        description: "The vault info data"
    })
    [Network.Mainnet]: VaultInfo
    @Field(() => VaultInfo, {
        description: "The vault info data"
    })
    [Network.Testnet]: VaultInfo
}
