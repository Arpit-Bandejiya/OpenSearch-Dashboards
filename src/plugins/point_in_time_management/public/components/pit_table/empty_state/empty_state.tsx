/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiEmptyPrompt } from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import React from 'react';
import { History } from 'history';
import { CreateButton } from '../../create_button';

interface Props {
  history: History;
}

export const EmptyState = ({ history }: Props) => {
  console.log('history in empty state', history);
  const createButton = (
    <CreateButton history={history} isEmptyState={true} dataTestSubj="createPitButton" />
  );

  return (
    <EuiEmptyPrompt
      body={
        <p>
          <FormattedMessage
            id="pointInTimeManagement.pointInTimeDescription"
            defaultMessage="No PIT objects have been created."
          />
        </p>
      }
      actions={createButton}
    />
  );
};

export const NoDataSourceState = () => (
  <EuiEmptyPrompt
    body={
      <p>
        <FormattedMessage
          id="pointInTimeManagement.noDataSource"
          defaultMessage="Please select a valid data source to continue."
        />
      </p>
    }
  />
);
