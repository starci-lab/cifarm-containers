export enum StateMutability {
    VIEW = "view",
    NONPAYABLE = "nonpayable"
}

export enum AbiType {
    ERROR = "error",
    EVENT = "event",
    FUNCTION = "function"
}

export interface AbiElement {
    internalType: string
    name: string
    type: string
    indexed?: boolean
}

export const stringInput = (name: string): AbiElement => ({
    internalType: "string",
    name,
    type: "string"
})

export const addressInput = (name: string): AbiElement => ({
    internalType: "address",
    name,
    type: "address"
})

export const uintInput = (name: string, bits: number = 256): AbiElement => ({
    internalType: `uint${bits}`,
    name,
    type: `uint${bits}`
})

export const bytesInput = (name: string, size: number = 0): AbiElement => ({
    internalType: `bytes${size > 0 ? size : ""}`,
    name,
    type: `bytes${size > 0 ? size : ""}`
})

export const createError = (
    name: string,
    inputs: AbiElement[] = []
): { name: string; inputs: AbiElement[]; type: AbiType.ERROR } => ({
    name,
    inputs,
    type: AbiType.ERROR
})

export const createEvent = (
    name: string,
    inputs: AbiElement[] = [],
    anonymous: boolean = false
): { name: string; inputs: AbiElement[]; anonymous: boolean; type: AbiType.EVENT } => ({
    name,
    inputs,
    anonymous,
    type: AbiType.EVENT
})

export const createFunction = (
    name: string,
    inputs: AbiElement[] = [],
    outputs: AbiElement[] = [],
    stateMutability: StateMutability = StateMutability.NONPAYABLE
): {
    name: string
    inputs: AbiElement[]
    outputs: AbiElement[]
    stateMutability: StateMutability
    type: AbiType.FUNCTION
} => ({
    name,
    inputs,
    outputs,
    stateMutability,
    type: AbiType.FUNCTION
})
