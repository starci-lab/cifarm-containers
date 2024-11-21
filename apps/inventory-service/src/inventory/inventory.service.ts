import { Injectable, Logger } from "@nestjs/common"
import { InventoryEntity } from "@src/database"
import { DataSource } from "typeorm"
import {
    AddInventoryRequest,
    AddInventoryResponse,
    GetInventoryRequest,
    GetInventoryResponse
} from "./inventory.dto"

@Injectable()
export class InventoryService {
    private readonly logger: Logger = new Logger(InventoryService.name)
    constructor(private readonly dataSource: DataSource) {}

    public async addInventory(request: AddInventoryRequest): Promise<AddInventoryResponse> {
        let remainingQuantity = request.quantity
        const inventories = await this.dataSource.manager.find(InventoryEntity, {
            where: { referenceKey: request.key, userId: request.userId }
        })

        for (const inventory of inventories) {
            if (remainingQuantity <= 0) break

            const spaceInCurrentStack = request.maxStack - inventory.quantity
            if (spaceInCurrentStack > 0) {
                const quantityToAdd = Math.min(spaceInCurrentStack, remainingQuantity)
                inventory.quantity += quantityToAdd
                remainingQuantity -= quantityToAdd
                await this.dataSource.manager.save(inventory)
            }
        }

        //gọi cái create quá nhiều, add dc 1 mảng
        //update cái đã có, tạo mới những cái chưa có
        //update()
        //create[]
        //create
        while (remainingQuantity > 0) {
            const newQuantity = Math.min(request.maxStack, remainingQuantity)
            const newInventory = this.dataSource.manager.create(InventoryEntity, {
                ...request,
                userId: request.userId,
            })
            remainingQuantity -= newQuantity
            await this.dataSource.manager.save(newInventory)
        }

        return
    }

    public async getInventory(request: GetInventoryRequest): Promise<GetInventoryResponse> {
        const { userId } = request

        const items = await this.dataSource.manager.find(InventoryEntity, {
            where: { userId }
        })

        return { items }
    }
}
