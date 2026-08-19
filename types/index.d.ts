import type { Pinia } from 'pinia'
import type bus from '../src/bus'
import * as tools from '@/tools'

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

export interface PluginHasStore extends PluginBase {
  name: string
  storeModule: any // Pinia store definition
}

export type Plugin =
  | PluginBase
  | PluginHasStore
  | ((ctx: PluginCtx) => Plugin | void)

export type PluginFunction = (ctx: PluginCtx) => Plugin | void

export type CreateOptions = {
  config: import('../src/bus').BusConfig
  plugins: Plugin[]
}
