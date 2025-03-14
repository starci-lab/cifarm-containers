/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { DynamicModule, Provider, Type } from "@nestjs/common"

export type NestImport = Type<unknown> | DynamicModule
export type NestProvider = Provider
export type NestService = NestProvider
export type NestExport = NestImport | NestProvider
export type NestController = Function