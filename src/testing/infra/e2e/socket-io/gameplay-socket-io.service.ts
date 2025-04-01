import { Injectable } from "@nestjs/common"
import { Socket, Manager } from "socket.io-client"
import { urlMap } from "./socket-io.utils"
import { IoService } from "./socket-io.types"

@Injectable()
export class E2EGameplaySocketIoService {
    public readonly managerWrapperMap: Record<string, ManagerWrapper>
    private url: string
    constructor() {
        this.managerWrapperMap = {}
        this.url = urlMap()[IoService.Io]
    }

    public async create(name: string): Promise<ManagerWrapper> {
        // const accessToken = await this.e2eAxiosService.getToken({ name })
        // if (!accessToken) {
        //     throw new Error("Access token not found")
        // }
        // const manager = new Manager(this.url, {
        //     autoConnect: false,
        // })
        // const managerWrapper: ManagerWrapper = {
        //     manager,
        //     createSocket: (socketName: string, [ nsp, options ]: Parameters<Manager["socket"]>) => {
        //         const socket = manager.socket(nsp, {
        //             auth: {
        //                 token: accessToken
        //             },
        //             ...options
        //         })
        //         this.managerWrapperMap[name].socketMap[socketName] = socket
        //         return socket
        //     },
        //     socketMap: {}
        // }
        // this.managerWrapperMap[name] = managerWrapper
        // return managerWrapper
    }

    public clear(): void {
        for (const { socketMap } of Object.values(this.managerWrapperMap)) {
            for (const socket of Object.values(socketMap)) {
                socket.disconnect()
            }
        }
    }
}

export interface ManagerWrapper {
    manager: Manager
    createSocket(name: string, params: Parameters<Manager["socket"]>): Socket
    socketMap: Record<string, Socket>
}
