export interface EmitActionPayload<TData = undefined> {
    userId: string
    placedItemId: string
    action?: ActionName
    success?: boolean
    data?: TData
    reasonCode?: number
}

export type ActionEmittedMessage<TData = undefined> = Omit<EmitActionPayload<TData>, "userId">

export enum ActionName {
    Water = "Water",
}