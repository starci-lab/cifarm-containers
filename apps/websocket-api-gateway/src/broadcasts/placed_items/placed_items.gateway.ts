import { websocketBroadcastGrpcConstants } from "@apps/broadcast-service"
import { Inject, Logger, OnModuleInit } from "@nestjs/common"
import { ClientGrpc } from "@nestjs/microservices"
import { Interval } from "@nestjs/schedule"
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets"
import { Server } from "socket.io"
import { IPlacedItemsService } from "./placed_items.service"
import { lastValueFrom } from "rxjs"

@WebSocketGateway({
    cors: {
        origin: "*",
    },
})
export class PlacedItemsGateway implements OnModuleInit {
    private readonly logger = new Logger(PlacedItemsGateway.name)

    private placedItemsService: IPlacedItemsService
    constructor(
      @Inject(websocketBroadcastGrpcConstants.NAME) private client: ClientGrpc,
    ) {}

    onModuleInit() {
        this.placedItemsService = this.client.getService<IPlacedItemsService>(
            websocketBroadcastGrpcConstants.SERVICE,
        )
    }
    
  @WebSocketServer()
    private readonly server: Server

  @Interval(1000)
  async broadcastPlacedItems() {
      this.logger.verbose("Broadcasting placed items")
      const response = await lastValueFrom(this.placedItemsService.broadcastPlacedItems({ userId : "test"}))
      this.server.emit("placed_items", response)
  }
}
