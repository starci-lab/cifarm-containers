import {
    addressInput,
    createError,
    createEvent,
    createFunction,
    StateMutability,
    stringInput,
    uintInput
} from "./utils.abi"

export const erc20Abi = [
    {
        inputs: [stringInput("_name"), stringInput("_symbol")],
        stateMutability: StateMutability.NONPAYABLE,
        type: "constructor"
    },
    createError("AccessControlBadConfirmation"),
    createError("ERC20InsufficientAllowance", [
        addressInput("spender"),
        uintInput("allowance"),
        uintInput("needed")
    ]),
    createEvent("Approval", [
        { ...addressInput("owner"), indexed: true },
        { ...addressInput("spender"), indexed: true },
        uintInput("value")
    ]),
    createFunction("balanceOf", [addressInput("account")], [uintInput("")], StateMutability.VIEW),
    createFunction(
        "transfer",
        [addressInput("to"), uintInput("value")],
        [{ internalType: "bool", name: "", type: "bool" }]
    )
] as const
