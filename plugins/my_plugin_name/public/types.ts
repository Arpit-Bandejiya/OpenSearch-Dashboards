import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';
import { HomePublicPluginSetup } from '../../../src/plugins/home/public';

import { ManagementSetup } from '../../../src/plugins/management/public';
import { DataPublicPluginStart } from 'src/plugins/data/public';

export interface MyPluginNamePluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MyPluginNamePluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart
}

export interface SetupDependencies {
  management: ManagementSetup;
}