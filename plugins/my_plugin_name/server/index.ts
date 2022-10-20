import { PluginInitializerContext } from '../../../src/core/server';
import { MyPluginNamePlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new MyPluginNamePlugin(initializerContext);
}

export { MyPluginNamePluginSetup, MyPluginNamePluginStart } from './types';
