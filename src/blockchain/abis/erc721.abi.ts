import {
    addressInput,
    createError,
    createEvent,
    createFunction,
    StateMutability,
    stringInput,
    uintInput
} from "./utils.abi"

export const erc721Abi = [
    {
        inputs: [stringInput("_name"), stringInput("_symbol")],
        stateMutability: StateMutability.NONPAYABLE,
        type: "constructor"
    },
    createError("ERC721NonexistentToken", [uintInput("tokenId")]),
    createEvent("Approval", [
        { ...addressInput("owner"), indexed: true },
        { ...addressInput("approved"), indexed: true },
        { ...uintInput("tokenId"), indexed: true }
    ]),
    createFunction("ownerOf", [uintInput("tokenId")], [addressInput("")], StateMutability.VIEW),
    createFunction("transferFrom", [addressInput("from"), addressInput("to"), uintInput("tokenId")])
] as const
