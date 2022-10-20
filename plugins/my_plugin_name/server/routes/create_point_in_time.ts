import { schema } from '@osd/config-schema';
import { HttpResources, HttpServiceSetup, IRouter } from '../../../../src/core/server';
import { CREATE_POINT_IN_TIME_PATH } from '../../common';

export function createPointInTimeRoute(
  router: IRouter,
  http: HttpServiceSetup & { resources: HttpResources }
) {
  router.post(
    {
      path: `${CREATE_POINT_IN_TIME_PATH}/{index}`,
      validate: {
        params: schema.object({
          index: schema.string(),
        }),
      },
    },
    async (context, request, response) => {
      const { index } = request.params;
      const respLocal = await context.core.opensearch.client.asCurrentUser.create_pit(
        {
          index,
          keep_alive: '12h',
        },
        {}
      );
      return response.ok({
        body: {
          pit_id: respLocal.body.pit_id,
          creation_time: respLocal.body.creation_time,
        },
      });
    }
  );
}
