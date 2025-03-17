import { PlacedItemTypeSchema, Position } from "@src/databases"
import { Connection } from "mongoose"

export interface GetOccupiedPositionsParams {
    userId: string
    connection: Connection,
}

export interface CheckPositionAvailableParams {
    placedItemType: PlacedItemTypeSchema,
    occupiedPositions: Array<Position>
}