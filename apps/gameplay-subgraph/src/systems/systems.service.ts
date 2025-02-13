import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    AnimalRandomness,
    CropRandomness,
    EnergyRegen,
    SpinInfo,
    DefaultInfo,
    InjectMongoose,
    SystemSchema,
    SystemKey,
    SystemRecord,
    DailyRewardInfo,
} from "@src/databases"
import { Connection } from "mongoose"
// import { ACTIVITIES_CACHE_NAME } from "./system.constants"
// import { envConfig } from "@src/env"

@Injectable()
export class SystemsService {
    private readonly logger = new Logger(SystemsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
    ) {}

    async getActivities(): Promise<Activities> {
        const mongoSession = await this.connection.startSession()
        try {
            const { value } =  await this.connection.model<SystemSchema>(SystemSchema.name).findOne<SystemRecord<Activities>>({
                key: SystemKey.Activities
            })
            return value
        } finally {
            await mongoSession.endSession()
        }
    }

    async getCropRandomness(): Promise<CropRandomness> {
        const mongoSession = await this.connection.startSession()
        try {
            const { value } = await this.connection.model<SystemSchema>(SystemSchema.name).findOne<SystemRecord<CropRandomness>>({
                key: SystemKey.CropRandomness
            })
            return value
        } finally {
            await mongoSession.endSession()
        }
    }

    async getAnimalRandomness(): Promise<AnimalRandomness> {
        const mongoSession = await this.connection.startSession()
        try {
            const { value } = await this.connection.model<SystemSchema>(SystemSchema.name).findOne<SystemRecord<AnimalRandomness>>({
                key: SystemKey.AnimalRandomness
            })
            return value
        } finally {
            await mongoSession.endSession()
        }
    }

    async getDefaultInfo(): Promise<DefaultInfo> {
        const mongoSession = await this.connection.startSession()
        try {
            const { value } = await this.connection.model<SystemSchema>(SystemSchema.name).findOne<SystemRecord<DefaultInfo>>({
                key: SystemKey.DefaultInfo
            })
            return value
        } finally {
            await mongoSession.endSession()
        }
    }

    async getSpinInfo(): Promise<SpinInfo> {
        const mongoSession = await this.connection.startSession()
        try {
            const { value } = await this.connection.model<SystemSchema>(SystemSchema.name).findOne<SystemRecord<SpinInfo>>({
                key: SystemKey.SpinInfo
            })
            return value
        } finally {
            await mongoSession.endSession()
        }
    }

    async getEnergyRegen(): Promise<EnergyRegen> {
        const mongoSession = await this.connection.startSession()
        try {
            const { value } = await this.connection.model<SystemSchema>(SystemSchema.name).findOne<SystemRecord<EnergyRegen>>({
                key: SystemKey.EnergyRegen
            })
            return value
        } finally {
            await mongoSession.endSession()
        }
    }

    async getDailyRewardInfo(): Promise<DailyRewardInfo> {
        const mongoSession = await this.connection.startSession()
        try {
            const { value } = await this.connection.model<SystemSchema>(SystemSchema.name).findOne<SystemRecord<DailyRewardInfo>>({
                key: SystemKey.DailyRewardInfo
            })
            return value
        } finally {
            await mongoSession.endSession()
        }
    }
}
