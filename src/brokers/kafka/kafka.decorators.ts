import { Inject } from "@nestjs/common"
import { KAFKA } from "./kafka.constants"

export const InjectKafka = () => Inject(KAFKA)