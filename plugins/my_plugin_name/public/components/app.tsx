import React, { useState } from 'react';
import { i18n } from '@osd/i18n';
import { FormattedMessage, I18nProvider } from '@osd/i18n/react';
import { BrowserRouter as Router } from 'react-router-dom';

import {
  EuiButton,
  EuiHorizontalRule,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageHeader,
  EuiTitle,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
} from '@elastic/eui';

import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';

import { PointInTimeTableWithRouter } from '../../components/point_in_time_table'

import { PointInTimeFlyout } from '../../components/point_in_time_flyout';

import { PLUGIN_ID, PLUGIN_NAME } from '../../common';
import { OpenSearchDashboardsContextProvider } from '../../../../src/plugins/opensearch_dashboards_react/public';
import { DataPublicPluginStart } from '../../../../src/plugins/data/public';

interface MyPluginNameAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  savedObjects: CoreStart['savedObjects'];
  data: DataPublicPluginStart;
}

export const MyPluginNameApp = ({
  basename,
  notifications,
  http,
  navigation,
  savedObjects,
  data
}: MyPluginNameAppDeps) => {
  // Use React hooks to manage state.
  const [timestamp, setTimestamp] = useState<string | undefined>();

  const onClickHandler = () => {
    // Use the core http service to make a response to the server API.
    http.get('/api/my_plugin_name/example').then((res) => {
      setTimestamp(res.time);
      // Use the core notifications service to display a success message.
      notifications.toasts.addSuccess(
        i18n.translate('myPluginName.dataUpdated', {
          defaultMessage: 'Data updated',
        })
      );
    });
  };

  const deps: MyPluginNameAppDeps = {
    savedObjects,
    notifications,
    http,
    data,
  };
  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  // return (
  //   <Router basename={basename}>
  //     <I18nProvider>
  //       <>
  //         <navigation.ui.TopNavMenu
  //           appName={PLUGIN_ID}
  //           showSearchBar={true}
  //           useDefaultBehaviors={true}
  //         />
  //         <EuiPage restrictWidth="1000px">
  //           <EuiPageBody component="main">
  //             <EuiPageHeader>
  //               <EuiTitle size="l">
  //                 <h1>
  //                   <FormattedMessage
  //                     id="myPluginName.helloWorldText"
  //                     defaultMessage="{name}"
  //                     values={{ name: PLUGIN_NAME }}
  //                   />
  //                 </h1>
  //               </EuiTitle>
  //             </EuiPageHeader>
  //             <EuiPageContent>
  //               <EuiPageContentHeader>
  //                 <EuiTitle>
  //                   <h2>
  //                     <FormattedMessage
  //                       id="myPluginName.congratulationsTitle"
  //                       defaultMessage="Congratulations, you have successfully created a new OpenSearch Dashboards Plugin 11!"
  //                     />
  //                   </h2>
  //                 </EuiTitle>
  //               </EuiPageContentHeader>
  //               <EuiPageContentBody>
  //                 <EuiText>
  //                   <p>
  //                     <FormattedMessage
  //                       id="myPluginName.content"
  //                       defaultMessage="Look through the generated code and check out the plugin development documentation 1."
  //                     />
  //                   </p>
  //                   <EuiHorizontalRule />
  //                   <p>
  //                     <FormattedMessage
  //                       id="myPluginName.timestampText"
  //                       defaultMessage="Last timestamp: {time}"
  //                       values={{ time: timestamp ? timestamp : 'Unknown' }}
  //                     />
  //                   </p>
  //                   <EuiButton type="primary" size="s" onClick={onClickHandler}>
  //                     <FormattedMessage id="myPluginName.buttonText" defaultMessage="Get data" />
  //                   </EuiButton>
  //                 </EuiText>
  //               </EuiPageContentBody>
  //             </EuiPageContent>
  //           </EuiPageBody>
  //         </EuiPage>
  //       </>
  //     </I18nProvider>
  //   </Router>
  // );

  return (
    <Router basename={basename}>
      <OpenSearchDashboardsContextProvider services={deps}>

      <I18nProvider>
        <>
          {/* <navigation.ui.TopNavMenu
            appName={PLUGIN_ID}
            showSearchBar={true}
            useDefaultBehaviors={true}
          /> */}
          <PointInTimeTableWithRouter canSave={true}/>
        </>
      </I18nProvider>
      </OpenSearchDashboardsContextProvider>
    </Router>
  );
};
