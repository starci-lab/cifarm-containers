import { IsBoolean } from "class-validator"

export class UpdateTutorialMessage {
    @IsBoolean()
        start: boolean
    @IsBoolean()
        openShopModal: boolean
    @IsBoolean()
        openInventoryModal: boolean
    @IsBoolean()
        plant: boolean
    @IsBoolean()
        openNeighborsModal: boolean
    @IsBoolean()
        atNeighbor: boolean
}