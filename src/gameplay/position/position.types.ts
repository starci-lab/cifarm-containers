import { PlacedItemTypeSchema } from "@src/databases"
import { Connection } from "mongoose"
import { PositionOutput } from "../gameplay.types"

export interface GetOccupiedPositionsParams {
    userId: string
    connection: Connection,
}

export interface CheckPositionAvailableParams {
    placedItemType: PlacedItemTypeSchema,
    occupiedPositions: Array<PositionOutput>
}