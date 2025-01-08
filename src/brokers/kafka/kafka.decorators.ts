import { Inject } from "@nestjs/common";
import { Brokers } from "../brokers.constants";
import { KAFKA } from "./kafka.constants";

export const InjectKafka = () => Inject(KAFKA);