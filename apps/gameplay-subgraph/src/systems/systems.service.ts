import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    Activities,
    AnimalRandomness,
    CropRandomness,
    EnergyRegen,
    SpinInfo,
    DefaultInfo,
    InjectMongoose,
    SystemSchema,
    SystemId,
    SystemRecord,
    DailyRewardInfo,
} from "@src/databases"
import { Connection } from "mongoose"

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
            const { value } =  await this.connection.model<SystemSchema>(SystemSchema.name).findById<SystemRecord<Activities>>(createObjectId(SystemId.Activities))
            return value
        } finally {
            await mongoSession.endSession()
        }
    }

    async getCropRandomness(): Promise<CropRandomness> {
        const mongoSession = await this.connection.startSession()
        try {
            const { value } = await this.connection.model<SystemSchema>(SystemSchema.name).findById<SystemRecord<CropRandomness>>(createObjectId(SystemId.CropRandomness))
            return value
        } finally {
            await mongoSession.endSession()
        }
    }

    async getAnimalRandomness(): Promise<AnimalRandomness> {
        const mongoSession = await this.connection.startSession()
        try {
            const { value } = await this.connection.model<SystemSchema>(SystemSchema.name).findById<SystemRecord<AnimalRandomness>>(createObjectId(SystemId.AnimalRandomness))
            return value
        } finally {
            await mongoSession.endSession()
        }
    }

    async getDefaultInfo(): Promise<DefaultInfo> {
        const mongoSession = await this.connection.startSession()
        try {
            const { value } = await this.connection.model<SystemSchema>(SystemSchema.name).findById<SystemRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
            return value
        } finally {
            await mongoSession.endSession()
        }
    }

    async getSpinInfo(): Promise<SpinInfo> {
        const mongoSession = await this.connection.startSession()
        try {
            const { value } = await this.connection.model<SystemSchema>(SystemSchema.name).findById<SystemRecord<SpinInfo>>(createObjectId(SystemId.SpinInfo))
            return value
        } finally {
            await mongoSession.endSession()
        }
    }

    async getEnergyRegen(): Promise<EnergyRegen> {
        const mongoSession = await this.connection.startSession()
        try {
            const { value } = await this.connection.model<SystemSchema>(SystemSchema.name).findById<SystemRecord<EnergyRegen>>(createObjectId(SystemId.EnergyRegen))
            return value
        } finally {
            await mongoSession.endSession()
        }
    }

    async getDailyRewardInfo(): Promise<DailyRewardInfo> {
        const mongoSession = await this.connection.startSession()
        try {
            const { value } = await this.connection.model<SystemSchema>(SystemSchema.name).findById<SystemRecord<DailyRewardInfo>>(createObjectId(SystemId.DailyRewardInfo))
            return value
        } finally {
            await mongoSession.endSession()
        }
    }
}
