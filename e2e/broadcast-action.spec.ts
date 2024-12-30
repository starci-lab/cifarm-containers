import { Test } from "@nestjs/testing"
import { authAxios, GrpcServiceName, SupportedChainKey } from "@src/grpc"
import { UserEntity } from "@src/databases"
import { configForRoot, grpcClientRegisterAsync, typeOrmForFeature, typeOrmForRoot } from "@src/dynamic-modules"
import { JwtModule, JwtService, UserLike } from "@src/services"
import { io, Socket } from "socket.io-client"
import { DataSource } from "typeorm"

describe("WebSocket Broadcast Gateway - Authenticated Users", () => {
    const sockets: Socket[] = []
    const totalClients = 2
    let dataSource: DataSource
    let jwtService: JwtService
    const users: UserLike[] = []
    const accessTokens: string[] = []

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                configForRoot(),
                typeOrmForRoot(),
                 ,
                grpcClientRegisterAsync(GrpcServiceName.Gameplay),
                JwtModule,
            ],
        }).compile()
    
        dataSource = module.get<DataSource>(DataSource)
        jwtService = module.get<JwtService>(JwtService)
    
        // Create users and retrieve access tokens
        for (let i = 0; i < totalClients; i++) {
            // Simulate user login
            const { data } = await authAxios().post("/test-signature", {
                chainKey: SupportedChainKey.Avalanche,
                accountNumber: i + 1,
                network: "Testnet",
            })
    
            const { data: verifySignatureData } = await authAxios().post("/verify-signature", data)
            const accessToken = verifySignatureData.accessToken
    
            const user = await jwtService.decodeToken(accessToken)
            users.push(user)
            accessTokens.push(accessToken)
        }
    
        console.log(`Created and authenticated ${totalClients} users.`)
    

        const connectionPromises = users.map((_, i) => {
            return new Promise<void>((resolve, reject) => {
                const socketBroadcast = io("http://localhost:3003/broadcast", {
                    transports: ["websocket"],
                    query: { token: accessTokens[i] },
                    reconnection: false,
                })
    
                socketBroadcast.on("connect", () => {
                    sockets.push(socketBroadcast)
                    resolve()
                })
    
                socketBroadcast.on("connect_error", (error) => {
                    reject(error)
                })

                socketBroadcast.on("hello_world", (data: any) => {
                    console.log(`Client ${i + 1} received hello world message:`, data)
                    expect(data.message).toBe("Hello World")
                })
            })
        })
    
        await Promise.all(connectionPromises)
    })
    

    it("should confirm clients are authenticated and connected", (done) => {
        sockets.forEach((socket, index) => {
            console.log(`Client ${index + 1} connected: ${socket.id}`)

            socket.on("connection_count", (data) => {
                console.log(`Server reports ${data.count} clients connected`)
                expect(data.count).toBe(totalClients)
                done()
            })

            socket.emit("request_connection_count")

            socket.on("hello_world", (data) => {
                console.log("Received hello world message:", data)
                expect(data.message).toBe("Hello World")
                done()
            })
        })

        console.log("- Sending hello world message to all clients...")
        sockets[0].emit("send_hello_world_to_all")
    })

    afterAll(async () => {
        // Disconnect all clients
        sockets.forEach((socket, index) => {
            console.log(`Client ${index + 1} disconnected: ${socket.id}`)
            socket.disconnect()
        })

        // Remove users from the database
        console.log("Cleaning up test users...")
        
        await dataSource.manager.remove(UserEntity, users)

        await dataSource.destroy()
    })
})
