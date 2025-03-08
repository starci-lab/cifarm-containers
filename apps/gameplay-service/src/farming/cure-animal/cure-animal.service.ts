import { Injectable, Logger } from "@nestjs/common"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import {
    Activities,
    AnimalCurrentState,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    InventoryTypeSchema,
    KeyValueRecord,
    PlacedItemSchema,
    SupplyId,
    SystemId,
    SystemSchema,
    UserSchema
} from "@src/databases"
import { EnergyService, InventoryService, LevelService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { CureAnimalRequest, CureAnimalResponse } from "./cure-animal.dto"
import { InjectKafka, KafkaPattern } from "@src/brokers"
import { ClientKafka } from "@nestjs/microservices"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"

@Injectable()
export class CureAnimalService {
    private readonly logger = new Logger(CureAnimalService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        @InjectKafka()
        private readonly clientKafka: ClientKafka
    ) {}

    async cureAnimal({ placedItemAnimalId, inventorySupplyId, userId }: CureAnimalRequest): Promise<CureAnimalResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        let actionMessage: EmitActionPayload | undefined
        try {
            const placedItemAnimal = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .findById(placedItemAnimalId)
                .session(mongoSession)

            if (!placedItemAnimal) throw new GrpcNotFoundException("Placed Item animal not found")
            if (placedItemAnimal.user.toString() !== userId) throw new GrpcFailedPreconditionException("Cannot cure another user's animal")
            if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Sick) throw new GrpcFailedPreconditionException("Animal is not sick")

            const { value: { cureAnimal: { energyConsume, experiencesGain } } } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
            
            const user = await this.connection.model<UserSchema>(UserSchema.name)
                .findById(userId)
                .session(mongoSession)

            if (!user) throw new GrpcNotFoundException("User not found")

            this.energyService.checkSufficient({
                current: user.energy,
                required: energyConsume
            })

            const energyChanges = this.energyService.substract({ user, quantity: energyConsume })
            const experiencesChanges = this.levelService.addExperiences({ user, experiences: experiencesGain })

            const inventory = await this.connection.model<InventorySchema>(InventorySchema.name)
                .findById(inventorySupplyId)
                .session(mongoSession)

            if (!inventory) throw new GrpcNotFoundException("Inventory not found")
            
            const inventoryType = await this.connection.model<InventoryTypeSchema>(InventoryTypeSchema.name)
                .findById(inventory.inventoryType)
                .session(mongoSession)

            if (!inventoryType || inventoryType.type !== InventoryType.Supply) throw new GrpcFailedPreconditionException("Inventory type is not supply")
            if (inventoryType.displayId !== SupplyId.AnimalPill) throw new GrpcFailedPreconditionException("Inventory supply is not medicine")

            await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                { _id: user.id },
                { ...energyChanges, ...experiencesChanges }
            ).session(mongoSession)

            const { inventories } = await this.inventoryService.getRemoveParams({
                connection: this.connection,
                userId: user.id,
                session: mongoSession,
                inventoryType,
                kind: inventory.kind
            })
            const { removedInventories, updatedInventories } = this.inventoryService.remove({
                inventories,
                quantity: 1,
            })
            for (const inventory of updatedInventories) {
                await this.connection.model<InventorySchema>(InventorySchema.name).updateOne(
                    { _id: inventory._id },
                    inventory
                ).session(mongoSession)
            }
            await this.connection.model<InventorySchema>(InventorySchema.name).deleteMany({
                _id: { $in: removedInventories.map(inventory => inventory._id) }
            }).session(mongoSession)

            placedItemAnimal.animalInfo.currentState = AnimalCurrentState.Normal
            await placedItemAnimal.save({ session: mongoSession })

            actionMessage = {
                placedItemId: placedItemAnimalId,
                action: ActionName.CureAnimal,
                success: true,
                userId,
            }
            this.clientKafka.emit(KafkaPattern.EmitAction, actionMessage)
            this.clientKafka.emit(KafkaPattern.SyncPlacedItems, { userId })

            await mongoSession.commitTransaction()
            return {}
        } catch (error) {
            this.logger.error(error)
            if (actionMessage)
            {
                this.clientKafka.emit(KafkaPattern.EmitAction, actionMessage)
            }  
            await mongoSession.abortTransaction()
            throw new GrpcInternalException(error.message)
        } finally {
            await mongoSession.endSession()
        }
    }
}
