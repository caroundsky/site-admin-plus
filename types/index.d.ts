import Vue from 'vue'
import { Store, Module } from 'vuex'
import bus, { BusConfig } from '../src/bus'
import * as tools from '@/tools'

export interface PluginCtx {
  $tools: typeof tools
  $bus: typeof bus
  $store: Store<any>
  $on: Vue['$on']
  $emit: Vue['$emit']
}

export interface PluginBase {
  name?: string
  slots?: Record<string, any>
  effects?: (ctx: PluginCtx) => void
}

export interface PluginHasStore extends PluginBase {
  name: string
  storeModule: Module<any, any>
}

export type Plugin = PluginBase | PluginHasStore

export type PluginFunction = (ctx: PluginCtx) => Plugin | void

export type CreateOptions = {
  config: BusConfig
  store: Store<any>
  plugins: Plugin[]
}

export declare const create: (options?: CreateOptions) => any
