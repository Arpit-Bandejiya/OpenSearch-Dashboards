import './index.scss';

import { MyPluginNamePlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.
export function plugin() {
  return new MyPluginNamePlugin();
}
export { MyPluginNamePluginSetup, MyPluginNamePluginStart } from './types';
