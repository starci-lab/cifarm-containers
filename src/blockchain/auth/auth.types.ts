import { SignedMessage } from "../common"

export interface IBlockchainAuthService {
    getKeyPair: (accountNumber: number) => GetKeyPairResult
    signMessage: (params: SignMessageParams) => string
    verifyMessage(params: Omit<SignedMessage, "chainName">): boolean
}

export interface SignMessageParams {
    message: string
    privateKey: string
    publicKey?: string
}

export interface GetKeyPairResult {
    publicKey: string
    privateKey: string
    accountAddress: string
}