import { AbstractSocketData } from "@src/io"

export interface ObservingData {
    // The user ID of the user who is observing the game
    userId: string
}

export interface SocketData extends AbstractSocketData {
    observing: ObservingData
}