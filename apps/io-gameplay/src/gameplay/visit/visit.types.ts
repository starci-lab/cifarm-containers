export interface VisitedEmitter2Payload {
    // The user ID of the user who is being observed
    userId: string
    // Socket ID of the user who is observing the game
    socketId: string
}


export interface VisitPayload {
    userId: string
    neighborUserId: string
}

export interface ReturnPayload {
    userId: string
}

export interface ShowFadeMessage {
    toNeighbor: boolean
}