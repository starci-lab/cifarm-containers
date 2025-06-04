import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { Injectable, Logger } from "@nestjs/common"
import { Seeder } from "nestjs-seeder"
import { InjectMongoose, KeyValueStoreId, KeyValueStoreSchema, TokenKey } from "@src/databases"
import { createObjectId, DeepPartial } from "@src/common"
import { Connection } from "mongoose"
import { Network } from "@src/env"
dayjs.extend(utc)

@Injectable()
export class KeyValueStoreSeeder implements Seeder {
    private readonly logger = new Logger(KeyValueStoreSeeder.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) { }

    public async seed(): Promise<void> {
        this.logger.debug("Seeding key value store...")

        const data: Array<DeepPartial<KeyValueStoreSchema>> = [
            {
                _id: createObjectId(KeyValueStoreId.EnergyRegenerationLastSchedule),
                displayId: KeyValueStoreId.EnergyRegenerationLastSchedule,
                value: {
                    date: dayjs().utc().toDate()
                },
                version: 1
            },
            {
                _id: createObjectId(KeyValueStoreId.AnimalLastSchedule),
                displayId: KeyValueStoreId.AnimalLastSchedule,
                value: {
                    date: dayjs().utc().toDate()
                },
                version: 1
            },
            {
                _id: createObjectId(KeyValueStoreId.FruitLastSchedule),
                displayId: KeyValueStoreId.FruitLastSchedule,
                value: {
                    date: dayjs().utc().toDate()
                },
                version: 1
            },
            {
                _id: createObjectId(KeyValueStoreId.PlantLastSchedule),
                displayId: KeyValueStoreId.PlantLastSchedule,
                value: {
                    date: dayjs().utc().toDate()
                },
                version: 1
            },
            {
                _id: createObjectId(KeyValueStoreId.BeeHouseLastSchedule),
                displayId: KeyValueStoreId.BeeHouseLastSchedule,
                value: {
                    date: dayjs().utc().toDate()
                },
                version: 1
            },
            {
                _id: createObjectId(KeyValueStoreId.VaultInfos),
                displayId: KeyValueStoreId.VaultInfos,
                value: {
                    [Network.Mainnet]: {
                        data: [ 
                            {
                                tokenLocked: 0,
                                tokenKey: TokenKey.USDC
                            },
                            {
                                tokenLocked: 0,
                                tokenKey: TokenKey.CIFARM
                            },
                        ]
                    },
                    [Network.Testnet]: {
                        data: [
                            {
                                tokenLocked: 0,
                                tokenKey: TokenKey.USDC
                            },
                            {
                                tokenLocked: 0,
                                tokenKey: TokenKey.CIFARM
                            },
                        ]
                    },
                },
                version: 6
            }
        ]

        // Check each entry and only insert if it doesn't exist
        for (const entry of data) {
            const existingEntry = await this.connection.model<KeyValueStoreSchema>(KeyValueStoreSchema.name).findById(entry._id)
            if (!existingEntry || existingEntry.version !== entry.version) {
                // delete the existing entry if it exists
                await this.connection.model<KeyValueStoreSchema>(KeyValueStoreSchema.name).deleteOne({ _id: entry._id })
                await this.connection.model<KeyValueStoreSchema>(KeyValueStoreSchema.name).create(entry)
                this.logger.debug(`Created new key-value store entry: ${entry.displayId}`)
            } else {
                this.logger.debug(`Key-value store entry already exists: ${entry.displayId}`)
            }
        }
    }

    public async drop(): Promise<void> {
        //await this.connection.model(KeyValueStoreSchema.name).deleteMany({})
    }
}
