import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';

import { MyPluginNamePluginSetup, MyPluginNamePluginStart } from './types';
import { defineRoutes } from './routes';
import {pointInTime} from '../server/saved_objects/point_in_time';
import {createPointInTimeRoute} from "./routes/create_point_in_time";

export class MyPluginNamePlugin
  implements Plugin<MyPluginNamePluginSetup, MyPluginNamePluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('my_plugin_name: Setup');
    const router = core.http.createRouter();

    // Register server side APIs
    defineRoutes(router);
    createPointInTimeRoute(router, core.http);
    core.savedObjects.registerType(pointInTime);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('my_plugin_name: Started');
    return {};
  }

  public stop() {}
}
