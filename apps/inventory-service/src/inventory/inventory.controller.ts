import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { ApiBearerAuth } from "@nestjs/swagger"
import { InventoryService } from "./inventory.service"
import {
    AddInventoryRequest,
    AddInventoryResponse,
    GetInventoryRequest,
    GetInventoryResponse
} from "./inventory.dto"
import { inventoryGrpcConstants } from "../app.constants"

@ApiBearerAuth()
@Controller("inventory")
export class InventoryController {
    private readonly logger = new Logger(InventoryController.name)

    constructor(private readonly inventoryService: InventoryService) {}

    @GrpcMethod(inventoryGrpcConstants.SERVICE, "GetInventory")
    public async getInventory(request: GetInventoryRequest): Promise<GetInventoryResponse> {
        return this.inventoryService.getInventory(request)
    }

    @GrpcMethod(inventoryGrpcConstants.SERVICE, "AddInventory")
    public async addInventory(request: AddInventoryRequest): Promise<AddInventoryResponse> {
        this.logger.debug("AddInventory called")
        return this.inventoryService.addInventory(request)
    }
}
