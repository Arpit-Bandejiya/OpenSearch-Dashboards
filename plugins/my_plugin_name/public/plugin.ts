import { i18n } from '@osd/i18n';
import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import {
  MyPluginNamePluginSetup,
  MyPluginNamePluginStart,
  AppPluginStartDependencies,
  SetupDependencies
} from './types';
import { PLUGIN_NAME } from '../common';

export class MyPluginNamePlugin
  implements Plugin<MyPluginNamePluginSetup, MyPluginNamePluginStart> {
  public setup(core: CoreSetup, {management} : SetupDependencies ): MyPluginNamePluginSetup {
    
    // Register an application into the side navigation menu
    core.application.register({
      id: 'myPluginName',
      title: PLUGIN_NAME,
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application');
        // Get start services as specified in opensearch_dashboards.json
        const [coreStart, depsStart] = await core.getStartServices();
        // Render the application
        return renderApp(coreStart, depsStart as AppPluginStartDependencies, params);
      },
    });

   const opensearchDashboardsSection = management.sections.section.opensearchDashboards;

    opensearchDashboardsSection.registerApp({
      id: 'point_in_time',
      title: i18n.translate('pointInTime.managementSectionLabel', {
        defaultMessage: 'Point in time',
      }),
      order: 1,
      mount: async (mountParams) => {
        const { mountManagementSection } = await import('./management_app');
        const [coreStart, depsStart] = await core.getStartServices();
        return mountManagementSection(coreStart, depsStart as AppPluginStartDependencies, mountParams
      );
      },
    });

    // Return methods that should be available to other plugins
    return {
      getGreeting() {
        return i18n.translate('myPluginName.greetingText', {
          defaultMessage: 'Hello from {name}!',
          values: {
            name: PLUGIN_NAME,
          },
        });
      },
    };
  }

  public start(core: CoreStart): MyPluginNamePluginStart {
    return {};
  }

  public stop() {}
}
