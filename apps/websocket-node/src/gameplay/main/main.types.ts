export interface ObservingData {
    // The user ID of the user who is observing the game
    userId: string
}

export interface VisitedEmitter2Payload {
    // The user ID of the user who is being observed
    userId: string
    // Socket ID of the user who is observing the game
    socketId: string
}