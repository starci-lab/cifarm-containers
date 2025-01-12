import { INestApplication, Injectable } from "@nestjs/common"
import { IoAdapterFactory } from "../io.types"
import { ClusterIoAdapter } from "./cluster.adapter"

@Injectable()
export class ClusterIoAdapterFactory implements IoAdapterFactory {
    public createAdapter(app: INestApplication) {
        return new ClusterIoAdapter(app)
    }
}