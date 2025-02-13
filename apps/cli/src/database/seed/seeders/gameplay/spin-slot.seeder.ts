import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    AppearanceChance,
    InjectMongoose,
    SpinInfo,
    SpinPrizeSchema,
    SpinSlotSchema,
    SystemId,
    SystemSchema,
} from "@src/databases"
import { Connection } from "mongoose"
import { Seeder } from "nestjs-seeder"

@Injectable()
export class SpinSlotSeeder implements Seeder {
    private readonly logger = new Logger(SpinSlotSeeder.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}
        
    public async seed(): Promise<void> {
        this.logger.debug("Seeding spin slots...")
        // get system data
        const { value } = await this.connection.model<SystemSchema>(SystemSchema.name).findById(createObjectId(SystemId.SpinInfo))
        const { appearanceChanceSlots } = value as SpinInfo

        const commonPrizes = await this.connection.model<SpinPrizeSchema>(SpinPrizeSchema.name).find({
            appearanceChance: AppearanceChance.Common
        }).limit(appearanceChanceSlots[AppearanceChance.Common].count)
            
        const uncommonPrizes = await this.connection.model<SpinPrizeSchema>(SpinPrizeSchema.name).find({
            appearanceChance: AppearanceChance.Uncommon
        }).limit(appearanceChanceSlots[AppearanceChance.Uncommon].count)
 
        const rarePrizes = await this.connection.model<SpinPrizeSchema>(SpinPrizeSchema.name).find({
            appearanceChance: AppearanceChance.Rare
        }).limit(appearanceChanceSlots[AppearanceChance.Rare].count)
      
        const veryRarePrizes = await this.connection.model<SpinPrizeSchema>(SpinPrizeSchema.name).find({
            appearanceChance: AppearanceChance.VeryRare
        }).limit(appearanceChanceSlots[AppearanceChance.VeryRare].count)
        
        const data: Array<Partial<SpinSlotSchema>> = [
            ...commonPrizes.map((prize) => ({
                spinPrize: prize.id
            })),
            ...uncommonPrizes.map((prize) => ({
                spinPrize: prize.id
            })),
            ...rarePrizes.map((prize) => ({
                spinPrize: prize.id
            })),
            ...veryRarePrizes.map((prize) => ({
                spinPrize: prize.id
            }))
        ]
        await this.connection.model<SpinSlotSchema>(SpinSlotSchema.name).insertMany(data)
    }
    
    async drop(): Promise<void> {
        this.logger.verbose("Dropping spin slots...")
        await this.connection.model<SpinSlotSchema>(SpinSlotSchema.name).deleteMany({})
    }
}