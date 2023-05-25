/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import {
  IRouter,
  OpenSearchClient,
  OpenSearchDashboardsRequest,
  RequestHandlerContext,
} from 'opensearch-dashboards/server';

export function registerPitRoutes(router: IRouter) {
  router.post(
    {
      path: '/api/pit/all',
      validate: {
        body: schema.object({
          dataSourceId: schema.string(),
        }),
      },
    },
    async (context, req, res) => {
      const client: OpenSearchClient = await getClient(req, context);
      try {
        const pits = await client.getAllPits({});
        return res.ok({
          body: {
            ok: true,
            resp: pits.body,
          },
        });
      } catch (err: any) {
        return res.ok({
          body: {
            ok: false,
            resp: err.message,
          },
        });
      }
    }
  );

  router.post(
    {
      path: '/api/pit/addTime',
      validate: {
        body: schema.object({
          dataSourceId: schema.string(),
          pit_id: schema.string(),
          keepAlive: schema.string(),
        }),
      },
    },
    async (context, req, res) => {
      const client: OpenSearchClient = await getClient(req, context);
      console.log(req.body);
      try {
        const response = await client.search({
          body: {
            size: 0,
            pit: {
              id: req.body.pit_id,
              keep_alive: req.body.keepAlive,
            },
          },
        });
        return res.ok({
          body: {
            ok: true,
            resp: response.body,
          },
        });
      } catch (err: any) {
        return res.ok({
          body: {
            ok: false,
            resp: err.message,
          },
        });
      }
    }
  );
  router.post(
    {
      path: '/api/pit/delete',
      validate: {
        body: schema.object({
          dataSourceId: schema.string(),
          pit_id: schema.arrayOf(schema.string()),
        }),
      },
    },
    async (context, req, res) => {
      const client: OpenSearchClient = await getClient(req, context);
      try {
        const pits = await client.deletePit({ body: { pit_id: req.body.pit_id } });
        return res.ok({
          body: {
            ok: true,
            resp: pits.body,
          },
        });
      } catch (err: any) {
        return res.ok({
          body: {
            ok: false,
            resp: err.message,
          },
        });
      }
    }
  );

  router.post(
    {
      path: `/api/pit/create/{index}`,
      validate: {
        params: schema.object({
          index: schema.string(),
        }),
        query: schema.object({
          allowPartialFailures: schema.boolean({ defaultValue: true }),
          keepAlive: schema.string(),
        }),
        body: schema.object({
          dataSourceId: schema.string(),
        }),
      },
    },
    async (context, request, response) => {
      console.log('This is the request for create point in time path');
      console.log(request);
      const { index } = request.params;
      const { keepAlive, allowPartialFailures } = request.query;
      console.log(index);
      console.log(context);
      // eslint-disable-next-line @typescript-eslint/naming-convention
      debugger;
      const client: OpenSearchClient = await getClient(request, context);

      const response_local = await client.createPit(
        {
          index,
          keep_alive: keepAlive,
          allow_partial_pit_creation: allowPartialFailures,
        },
        {}
      );
      console.log('This is after posting', response_local);
      return response.ok({
        body: {
          pit_id: response_local.body.pit_id,
          creation_time: response_local.body.creation_time,
        },
      });
    }
  );
}

async function getClient(
  req: OpenSearchDashboardsRequest<
    unknown,
    unknown,
    Readonly<{} & { dataSourceId: string }>,
    'post'
  >,
  context: RequestHandlerContext
): Promise<OpenSearchClient> {
  return req.body.dataSourceId && req.body.dataSourceId !== 'default' && context.dataSource
    ? await context.dataSource.opensearch.getClient(req.body.dataSourceId)
    : context.core.opensearch.client.asCurrentUser;
}
function trimEnd(arg0: string, arg1: string) {
  throw new Error('Function not implemented.');
}
