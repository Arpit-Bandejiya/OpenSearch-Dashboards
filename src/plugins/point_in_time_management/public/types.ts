/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ApplicationStart,
  ChromeStart,
  HttpSetup,
  SavedObjectAttributes,
} from 'opensearch-dashboards/public';
import { NotificationsStart, SavedObjectsStart } from 'src/core/public';
import { DataPublicPluginStart } from 'src/plugins/data/public';
import { NavigationPublicPluginStart } from '../../navigation/public';
import { ManagementAppMountParams } from '../../management/public';
import { ManagementSetup } from '../../management/public';

export interface PointInTimeAttributes extends SavedObjectAttributes {
  creation_time?: number;
  keepAlive: number;
  name: string;
  pit_id?: string;
  id?: string;
  addtime: number;
  delete_on_expiry: boolean;
  isSavedObject?: boolean;
}

export interface ToastMessageItem {
  id: string;
  defaultMessage: string;
  success?: boolean;
}

export interface PointInTimeManagementContext {
  chrome: ChromeStart;
  application: ApplicationStart;
  notifications: NotificationsStart;
  savedObjects: SavedObjectsStart;
  http: HttpSetup;
  data: DataPublicPluginStart;
  setBreadcrumbs: ManagementAppMountParams['setBreadcrumbs'];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PointInTimeManagementPluginSetup {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PointInTimeManagementPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}

export interface SetupDependencies {
  management: ManagementSetup;
}
