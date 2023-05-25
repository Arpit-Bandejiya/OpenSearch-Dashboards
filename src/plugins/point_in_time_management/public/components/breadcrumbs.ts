/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from '@osd/i18n';

export function getListBreadcrumbs() {
  return [
    {
      text: i18n.translate('pitManagement.listBreadcrumb', {
        defaultMessage: 'Point in time',
      }),
      href: `/`,
    },
  ];
}

export function getEditBreadcrumbs() {
  return [
    ...getListBreadcrumbs(),
    {
      text: i18n.translate('dataSourcesManagement.dataSources.createBreadcrumb', {
        defaultMessage: 'Edit',
      }),
      href: `/edit`,
    },
  ];
}

export function getCreateBreadcrumbs() {
  return [
    ...getListBreadcrumbs(),
    {
      text: i18n.translate('dataSourcesManagement.dataSources.createBreadcrumb', {
        defaultMessage: 'Create',
      }),
      href: `/create`,
    },
  ];
}
