import { Injectable } from "@nestjs/common"
import { CheckPositionAvailableParams, GetAdjacentPositionsParams, GetOccupiedPositionsParams } from "./position.types"
import { PlacedItemSchema } from "@src/databases"
import { Position } from "@src/databases"
import _ from "lodash"
import { PositionNotAvailableException } from "../exceptions"
//service for computing the position of placed items
@Injectable()
export class PositionService {
    constructor() {}

    public async getOccupiedPositions({
        connection,
        userId,
        itself
    }: GetOccupiedPositionsParams): Promise<Array<Position>> {
        let placedItems = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .find({ user: userId })
            .select({
                x: 1,
                y: 1,
                _id: 0  // Exclude the _id field
            }).lean().exec()
        if (itself) {
            placedItems = placedItems.filter(placedItem => (placedItem.x !== itself.x && placedItem.y !== itself.y))
        }
        return placedItems
    }

    public checkPositionAvailable(
        {
            position,
            placedItemType,
            occupiedPositions
        }: CheckPositionAvailableParams
    ) {
        const { sizeX, sizeY } = placedItemType

        // Create an array of positions required to place the item
        const positions: Array<Position> = []

        for (let x = position.x ; x > position.x - sizeX; x--) {
            for (let y = position.y ; y > position.y - sizeY; y--) {
                positions.push({ x, y })
            }
        }

        // use lodash to check if the positions are available
        // Use lodash _.every and _.some to check if the positions are available
        const isValid = _.every(positions, position => {
            return !_.some(occupiedPositions, occupiedPosition => {
                return _.isEqual(occupiedPosition, position) // Use _.isEqual for deep comparison
            })
        })    
        if (!isValid) {
            throw new PositionNotAvailableException()
        }
    }

    public getAdjacentPositions({
        position,
        placedItemType,
    }: GetAdjacentPositionsParams): Array<Position> {
        const { sizeX, sizeY } = placedItemType
        // Create an array of positions required to place the item
        const positions: Array<Position> = []
        for (let x = position.x ; x > position.x - sizeX; x--) {
            for (let y = position.y ; y > position.y - sizeY; y--) {
                positions.push({ x, y })
            }
        }
        const adjacentPositions: Array<Position> = []
        for (let x = position.x + 1; x >= position.x - sizeX; x--) {
            for (let y = position.y + 1; y >= position.y - sizeY; y--) {
                // if the position not in the positions array, add it to the adjacent positions
                if (!positions.some(position => _.isEqual(position, { x, y }))) {
                    adjacentPositions.push({ x, y })
                }
            }
        }
        return adjacentPositions
    }
}
