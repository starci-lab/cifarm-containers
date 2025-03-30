import { Inject } from "@nestjs/common"
import { TELEGRAF } from "./constants"

export const InjectTelegraf = () => Inject(TELEGRAF)
