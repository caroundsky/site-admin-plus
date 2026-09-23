/**
 * 库对外的公共类型（插件相关）
 *
 * 这些类型同时被源码（src/main.ts 等）与消费方使用，因此放在源码树里；
 * 发布用的声明由 `yarn build:types` 从源码生成到 `types/` 目录。
 */
import type { Pinia } from 'pinia'
import bus, { type BusConfig } from '@/bus'
import * as tools from '@/tools'

export type {
  SimpleMap,
  NavMenuItem,
  MenuView,
  FavNavMenuItem,
  Theme,
  ContextButton,
} from './interfaces'

/** 插件运行时上下文，由 create/createLibrary 传给插件的 effects */
export interface PluginCtx {
  $tools: typeof tools
  $bus: typeof bus
  $store: Pinia
  $on: typeof bus.on
  $emit: typeof bus.emit
}

export interface PluginBase {
  name?: string
  slots?: Record<string, any>
  effects?: (ctx: PluginCtx) => void
}

export type Plugin = PluginBase | ((ctx: PluginCtx) => Plugin | void)

export type PluginFunction = (ctx: PluginCtx) => Plugin | void

export type CreateOptions = {
  config: BusConfig
  plugins: Plugin[]
}
