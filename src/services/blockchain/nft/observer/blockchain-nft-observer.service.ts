import { Injectable, Logger } from "@nestjs/common"
import { GetContractObservableParams } from "../common"
import { WebSocketProvider, Contract } from "ethers"
import { evmWsRpcUrl } from "../../rpcs"
import { erc721Abi } from "../../abis"
import * as WebSocket from "ws"

@Injectable()
export class BlockchainNftObserverService {
    private readonly logger = new Logger(BlockchainNftObserverService.name)

    constructor() {}

    public observeEvm({ chainKey, network, nftCollectionId, eventName, callbackFn }: GetContractObservableParams) {
        const ws = evmWsRpcUrl(chainKey, network)
        const websocket = new WebSocket(ws)
    
        websocket.on("close", () => {
            this.logger.debug(`WebSocket disconnected. Attempting to reconnect... : ${chainKey} ${network} ${eventName} `)
            start()
        })
        websocket.on("error", (error) => {
            this.logger.error(`WebSocket error encountered : ${error.message}`)
        })
    
        let contract: Contract | undefined
        const start = () => {
            const provider = new WebSocketProvider(websocket)
            if (contract) {
                contract.removeAllListeners(eventName)
            }
            contract = new Contract(nftCollectionId, erc721Abi, provider) 
              
            contract
                .on(eventName, callbackFn)
        }
        start()
    }
}

