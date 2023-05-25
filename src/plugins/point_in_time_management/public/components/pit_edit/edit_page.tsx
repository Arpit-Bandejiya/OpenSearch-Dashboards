/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { useEffectOnce, useMount } from 'react-use';
import { i18n } from '@osd/i18n';
import { useOpenSearchDashboards } from '../../../../opensearch_dashboards_react/public';
import { PointInTimeAttributes, PointInTimeManagementContext } from '../../types';
import { getEditBreadcrumbs } from '../breadcrumbs';
import { EditPitForm } from './edit_pit_form';
import {
  createPit,
  createPitSavedObjectWithIndexPatttern,
  findById,
  findPointInTimeSavedObject,
  updatePointInTimeById,
  updatePointInTimeKeepAlive,
} from '../utils';
import { ToastMessageItem } from '../../../../data_source_management/public/types';
import { getServices, Services } from '../../services';

const defaultPitSavedObject: PointInTimeAttributes = {
  pit_id: '',
  creation_time: 0,
  id: '',
  keepAlive: 0,
  name: '',
  addtime: 0,
  delete_on_expiry: false,
  isSavedObject: true,
};

export const PITEdit = (props) => {
  const {
    setBreadcrumbs,
    savedObjects,
    notifications: { toasts },
    http,
    data,
  } = useOpenSearchDashboards<PointInTimeManagementContext>().services;
  const PitID: string = props.match.params.id;
  const pit = props.location && props.location.state;
  console.log(pit);
  console.log(props.location.state);
  const [pitSavedObject, setPitSavedObject] = useState<PointInTimeAttributes>(
    defaultPitSavedObject
  );
  const [isLoading, setIsLoading] = useState(false);
  const [newProp, setNewProp] = useState(false);
  const services: Services = getServices(http);
  useEffectOnce(() => {
    console.log(PitID);
    setBreadcrumbs(getEditBreadcrumbs());
    setIsLoading(true);
    (async function () {
      await fetchPitSavedObject();
    })();
  });

  const fetchPitSavedObject = async () => {
    if (pit.isSavedObject) {
      const tempPitSavedObject = await findById(savedObjects.client, PitID);
      setNewProp(true);
      const pointInTimeAttributes: PointInTimeAttributes = {
        creation_time: tempPitSavedObject.attributes.creation_time,
        name: tempPitSavedObject.attributes.name,
        keepAlive: tempPitSavedObject.attributes.keepAlive,
        pit_id: tempPitSavedObject.attributes.pit_id,
        id: tempPitSavedObject.id,
        addtime: 0,
        delete_on_expiry: tempPitSavedObject.attributes.delete_on_expiry,
        isSavedObject: true,
      };
      console.log('This is teh attributes');
      console.log(pointInTimeAttributes);
      setPitSavedObject(pointInTimeAttributes);
      setIsLoading(false);
    } else {
      const pointInTimeAttributes: PointInTimeAttributes = {
        creation_time: pit.creation_time,
        name: '',
        keepAlive: pit.keep_alive,
        pit_id: pit.pit_id,
        addtime: 0,
        delete_on_expiry: false,
        isSavedObject: false,
      };
      console.log('For a local PIT these are the variables');
      console.log(pointInTimeAttributes);
      setPitSavedObject(pointInTimeAttributes);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (attributes: PointInTimeAttributes) => {
    if (attributes.isSavedObject) {
      console.log('These are the attributes', attributes);
      const new_keep_alive_proposal = attributes.addtime.toString() + 'm';
      console.log(attributes.pit_id, new_keep_alive_proposal);
      await services.addPitTime(attributes.pit_id, new_keep_alive_proposal, pit.dataSourceId);
      await updatePointInTimeById(savedObjects.client, attributes.id, attributes);
      props.history.push('/', pit.dataSourceId);
    } else {
      console.log('This is not saved object', attributes);
      if (attributes.addtime > 0) {
        console.log('time updated');
        // update pit time
        const new_keep_alive_proposal = attributes.addtime.toString() + 'm';
        await services.addPitTime(attributes.pit_id, new_keep_alive_proposal, pit.dataSourceId);
      }

      if (attributes.name !== '') {
        console.log('name updated');

        // createsavedobject

        services.getAllPits(pit.dataSourceId).then((fetchedPits) => {
          const backendPit = fetchedPits.resp.pits.filter((x) => x.pit_id === attributes.pit_id)[0];
          createPitSavedObjectWithIndexPatttern(
            {
              creation_time: backendPit.creation_time,
              dataSource: pit.dataSourceId ? pit.dataSourceId : '',
              delete_on_expiry: false,
              keepAlive: backendPit.keep_alive,
              name: attributes.name,
              pit_id: backendPit.pit_id,
              id: '',
            },
            savedObjects.client,
            data,
            backendPit.indices,
            pit.dataSourceId
          ).catch(() => {
            toasts.addDanger(
              i18n.translate('pitManagement.edit.createSavedObjectError', {
                defaultMessage: 'Error while creating saved object.',
              })
            );
          });
        });
      }

      // TODO:: Need to call the create PIT ID here.
      // TODO:: Add indices and data source in the PIT object and call createPit
      // await createPit(
      //   ['opensearch_dashboards_sample_data_ecommerce'],
      //   'opensearch_dashboards_sample_data_ecommerce', indexPatterns, dataSource, data,
      //   http, keepAlive, makedashboardschecked, pitName, savedObjects, deletepitchecked)
      props.history.push('/', pit.dataSourceId);
    }
  };

  const handleDisplayToastMessage = ({ id, defaultMessage, success }: ToastMessageItem) => {
    if (success) {
      toasts.addSuccess(i18n.translate(id, { defaultMessage }));
    } else {
      toasts.addWarning(i18n.translate(id, { defaultMessage }));
    }
  };

  return (
    <>
      {pitSavedObject.creation_time !== 0 ? (
        <EditPitForm
          existingPointInTime={pitSavedObject}
          newProp={newProp}
          handleSubmit={handleSubmit}
          displayToastMessage={handleDisplayToastMessage}
        />
      ) : null}
    </>
  );
};

export const PITEditWithRouter = withRouter(PITEdit);
