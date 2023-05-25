/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedObjectsType } from 'opensearch-dashboards/server';

export const pointInTimeSavedObject: SavedObjectsType = {
  name: 'point-in-time',
  namespaceType: 'agnostic',
  hidden: false,
  management: {
    icon: 'apps', // todo: pending ux #2034
    defaultSearchField: 'id',
    importableAndExportable: true,
    getTitle(obj) {
      return obj.attributes.name;
    },
    // getEditUrl(obj) {
    //   return `/management/opensearch-dashboards/dataSources/${encodeURIComponent(obj.id)}`;
    // },
    getInAppUrl(obj) {
      return {
        path: `/app/management/opensearch-dashboards/point-in-time/${encodeURIComponent(obj.id)}`,
        uiCapabilitiesPath: 'management.opensearchDashboards.dataSources',
      };
    },
  },
  mappings: {
    dynamic: false,
    properties: {
      dataSource: { type: 'text' },
      title: { type: 'text' },
      creation_time: { type: 'double' },
      keepAlive: { type: 'integer' },
      name: { type: 'text' },
      pit_id: { type: 'text' },
      delete_on_expiry: { type: 'boolean' },
    },
  },
};
