/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart, HttpFetchError } from 'opensearch-dashboards/public';

export interface Services {
  getAllPits: (dataSourceId?: string) => Promise<undefined | HttpFetchError>;
  deletePits: (pits: string[], dataSourceId?: string) => any;
  createPit: (
    index: string,
    keepAlive: string,
    allowPartialCreation: boolean,
    dataSourceId?: string
  ) => any;
  addPitTime: (pit_id: string, keepAlive: string, dataSourceId?: string) => any;
}

export function getServices(http: CoreStart['http']): Services {
  return {
    getAllPits: async (dataSourceId?: string) => {
      try {
        const response = await http.post('/api/pit/all', {
          body: JSON.stringify({
            dataSourceId: dataSourceId ? dataSourceId : '',
          }),
        });
        console.log('These are backend PITs');
        console.log(response);
        return response;
      } catch (e) {
        return e;
      }
    },
    addPitTime: async (pit_id: string, keepAlive: string, dataSourceId?: string) => {
      try {
        console.log(pit_id, keepAlive, dataSourceId);
        const response = await http.post('/api/pit/addTime', {
          body: JSON.stringify({
            dataSourceId: dataSourceId ? dataSourceId : '',
            pit_id,
            keepAlive,
          }),
        });
        console.log('Updated the PIT KeepAlive');
        console.log(response);
      } catch (e) {
        return e;
      }
    },

    deletePits: async (pits: string[], dataSourceId?: string) => {
      try {
        const response = await http.post('/api/pit/delete', {
          body: JSON.stringify({
            dataSourceId: dataSourceId ? dataSourceId : '',
            pit_id: pits,
          }),
        });
        return response;
      } catch (e) {
        return e;
      }
    },

    createPit: async (
      index: string,
      keepAlive: string,
      allowPartialCreation: boolean,
      dataSourceId?: string
    ) => {
      try {
        console.log('create pit : ' + dataSourceId);
        const response = await http.post('/api/pit/create/' + index, {
          body: JSON.stringify({
            dataSourceId: dataSourceId ? dataSourceId : '',
          }),
          query: {
            keepAlive,
            allowPartialFailures: allowPartialCreation,
          },
        });
        console.log('create pit response');
        console.log(response);
        return response;
      } catch (e) {
        return e;
      }
    },
  };
}
