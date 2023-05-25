/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  EuiButton,
  EuiText,
  EuiTitle,
  EuiFormRow,
  EuiSelect,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiFieldText,
  EuiPageContent,
  EuiCheckbox,
  EuiRadioGroup,
  EuiFieldNumber,
  EuiHorizontalRule,
  EuiSwitch,
  EuiComboBox,
  EuiLink
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import {
  ChromeStart,
  ApplicationStart,
  SavedObjectsStart,
  NotificationsStart,
  OverlayStart,
  HttpSetup,
  DocLinksStart,
} from 'opensearch-dashboards/public';
import { IUiSettingsClient } from 'opensearch-dashboards/server';
import { DataPublicPluginStart } from 'src/plugins/data/public';
import { ManagementAppMountParams } from 'src/plugins/management/public';
import { useEffectOnce } from 'react-use';
import { withRouter } from 'react-router-dom';
import { i18n } from '@osd/i18n';
import { createPit, getDataSources, getIndicesViaResolve } from '../utils';
import { DataSourceItem } from '../pit_table/pit_table';
import { useOpenSearchDashboards } from '../../../../opensearch_dashboards_react/public';
import { getCreateBreadcrumbs } from '../breadcrumbs';

export interface PointInTimeFlyoutItem {
  id: string;
  title: string;
  sort: string;
}

export interface IndexPatternManagmentContext {
  chrome: ChromeStart;
  application: ApplicationStart;
  savedObjects: SavedObjectsStart;
  uiSettings: IUiSettingsClient;
  notifications: NotificationsStart;
  overlays: OverlayStart;
  http: HttpSetup;
  docLinks: DocLinksStart;
  data: DataPublicPluginStart;
  setBreadcrumbs: ManagementAppMountParams['setBreadcrumbs'];
}

export interface PointInTimeFlyoutItem {
  id: string;
  title: string;
  sort: string;
}
export interface SavedObjectReference {
  name?: string;
  id: string;
  type: string;
}

export async function getPits(client, title: string) {
  if (title) {
    const savedObjects = await client.find({
      type: 'point-in-time',
      perPage: 1000,
      fields: ['id'],
    });

    return savedObjects.savedObjects;
  }
}

export async function findByTitle(client, title: string) {
  if (title) {
    const savedObjects = await client.find({
      type: 'point-in-time',
      perPage: 1000,
      fields: [],
    });

    return savedObjects.savedObjects.find(
      (obj) =>
        obj &&
        obj.attributes &&
        obj.attributes.name &&
        obj.attributes.name.toLowerCase() === title.toLowerCase()
    );
  }
}

export async function getIndexPatterns(savedObjectsClient) {
  return (
    savedObjectsClient
      .find({
        type: 'index-pattern',
        perPage: 10000,
      })
      .then((response) =>
        response.savedObjects
          .map((pattern) => {
            const id = pattern.id;
            const title = pattern.get('title');
            const references = pattern.references;
            let datasource = '';
            if (references.length > 0) {
              if (references.some((ref) => ref.type === 'data-source')) {
                datasource = references.find((ref) => ref.type === 'data-source').id;
              }
            }

            return {
              id,
              title,
              references,
              // the prepending of 0 at the default pattern takes care of prioritization
              // so the sorting will but the default index on top
              // or on bottom of a the table
              sort: `${title}`,
              datasource,
            };
          })
          .sort((a, b) => {
            if (a.sort < b.sort) {
              return -1;
            } else if (a.sort > b.sort) {
              return 1;
            } else {
              return 0;
            }
          })
      ) || []
  );
}

export const PointInTimeCreateForm = ({ history }) => {
  const [hourValue, setHourValue] = useState('0');
  const [minuteValue, setMinuteValue] = useState('5');

  const [keepAliveUnit, setKeepAliveUnit] = useState('h');
  const [makedashboardschecked, setMakedashboardschecked] = useState(true);
  const [partialfailurechecked, setPartialfailurechecked] = useState(true);
  const [loading, setLoading] = useState(true);

  const [indexPatterns, setIndexPatterns] = useState([] as PointInTimeFlyoutItem[]);
  const [selectedIndexPattern, setSelectedIndexPattern] = useState(``);
  const [pitName, setPitName] = useState('');

  const [deletepitchecked, setDeletepitchecked] = useState(true);
  const [deletepitdashboardchecked, setDeletepitdashboardchecked] = useState(false);
  const [radioIdSelected, setRadioIdSelected] = useState(``);
  const [showIndices, setShowIndices] = useState(false);
  const [showIndexPatterns, setShowIndexPatterns] = useState(false);
  const [selectedIndexOptions, setSelectedIndexOptions] = useState([]);

  // TODO: update this for cases when some data source name is default
  const defaultDataSource: DataSourceItem = { id: '', title: '', sort: '0', name: 'default' };

  const [dataSources, setDataSources] = useState<DataSourceItem[]>([defaultDataSource]);
  const [dataSource, setDataSource] = useState('');
  const [shouldCreateDisabled, setShouldCreateDisabled] = useState(true);

  const [indices, setIndices] = useState([]);

  const {
    setBreadcrumbs,
    savedObjects,
    notifications: { toasts },
    http,
    data,
  } = useOpenSearchDashboards<IndexPatternManagmentContext>().services;

  const onChange = (e) => {
    setKeepAliveTime(e.target.value);
  };

  useEffectOnce(() => {
    fetchDataSources();
  });

  useEffect(() => {
    if ((!selectedIndexOptions || selectedIndexOptions.length == 0) && (!selectedIndexPattern || selectedIndexPattern == ``)) {
      setShouldCreateDisabled(true);
    } else {
      setShouldCreateDisabled(false);
    }
    (async function () {
      const gettedIndexPatterns = await getIndexPatterns(savedObjects.client);
      // filter the index pattern w.r.t data source selected
      const dsIndexPatterns = gettedIndexPatterns.filter((x) => x.datasource == dataSource);
      setIndexPatterns(dsIndexPatterns);
      if (dsIndexPatterns.length > 0) {
        setSelectedIndexPattern(dsIndexPatterns[0].id);
      } else {
        setSelectedIndexPattern('');
      }
      console.log(gettedIndexPatterns);
      const gettedIndices = await getIndicesViaResolve(http, '*', false, dataSource);
      setIndices(gettedIndices);
      setBreadcrumbs(getCreateBreadcrumbs());
      setLoading(false);
    })();
  }, [savedObjects.client, dataSource]);

  useEffect(() => {
    if (((!selectedIndexOptions || selectedIndexOptions.length == 0) && (!showIndexPatterns)) || (pitName == `` && makedashboardschecked)) {
      setShouldCreateDisabled(true);
    } else {
      debugger;
      setShouldCreateDisabled(false);
    }
  }, [selectedIndexOptions, showIndexPatterns, pitName, makedashboardschecked]);



  const fetchDataSources = () => {
    getDataSources(savedObjects.client)
      .then((fetchedDataSources) => {
        if (fetchedDataSources?.length) {
          setDataSources(
            fetchedDataSources
              .concat([defaultDataSource])
              .sort((a, b) => a.sort.localeCompare(b.sort))
          );
        }
      })
      .catch(() => {
        toasts.addDanger(
          i18n.translate('pitManagement.pitTable.fetchDataSourceError', {
            defaultMessage: 'Unable to find existing data sources',
          })
        );
      });
  };

  const createPointInTime = async () => {
    //doValidations();

    const keepAlive = (60 * parseInt(hourValue) + parseInt(minuteValue)) + "m";
    try {
      if (makedashboardschecked) {
        const dupe = await findByTitle(savedObjects.client, pitName);
        if (dupe) {
          throw new Error(`Duplicate Point in time: ${pitName}`);
        }
      }
      if(selectedIndexPattern == `` && selectedIndexOptions.length == 0) {
        throw new Error(`Select an index pattern or set of indices`)
      }
      await createPit(
        selectedIndexOptions,
        selectedIndexPattern,
        indexPatterns,
        dataSource,
        data,
        http,
        keepAlive,
        makedashboardschecked,
        pitName,
        savedObjects,
        deletepitchecked
      );

      history.push('',dataSource);
      toasts.addSuccess('Point in time created successfully');
    } catch (e) {
      toasts.addDanger(e.message);
    }
    // setIsFlyoutVisible(false);
  };

  const createOptions = [
    {
      id: `index-pattern-option`,
      label: 'Create from index pattern',
    },
    {
      id: `index-option`,
      label: 'Create from indices',
    },
  ];

  const onRadioChange = (optionId) => {
    setRadioIdSelected(optionId);
    if (optionId == 'index-pattern-option') {
      setShowIndexPatterns(true);
      setShowIndices(false);
      setSelectedIndexOptions([]);
    } else if (optionId == 'index-option') {
      setShowIndices(true);
      setShowIndexPatterns(false);
      setSelectedIndexPattern(``);
    }
  };

  const onExpirationComboChange = (e) => {
    setKeepAliveUnit(e.target.value);
  };

  const onHourChange = (e) => {
    setHourValue(e.target.value);
  };

  const onMinuteChange = (e) => {
    setMinuteValue(e.target.value);
  };

  const onPartialFailureCheckChange = (e) => {
    setPartialfailurechecked(e.target.checked);
  };

  const oDashboardSwitchChange = (e) => {
    setMakedashboardschecked(e.target.checked);
  };

  const onDeletePitCheckboxChange = (e) => {
    setDeletepitchecked(e.target.checked);
  };

  console.log('index patterns : ' + showIndexPatterns);
  console.log('indices : ' + showIndices);

  let renderDataSource;
  const formatFieldsToComboBox = (fields) => {
    if (!fields) return [];

    return fields?.map((field) => {
      return {
        label: field.name,
      };
    });
  };
  const handleIndexOnChange = (selectedOptions) => {
    setSelectedIndexOptions(selectedOptions);
  };

  const onNameChange = (e) => {
    setPitName(e.target.value);
  };
  if (showIndices) {
    // Basically check if the pattern or selection of indices string match with existing index patterns
    // Also lets create index pattern only at the end
    // if selection of indices match index pattern, don't create index pattern
    // otherwise create index pattern
    renderDataSource = (
      <EuiFormRow
        label="Indices"
        helpText="Use an asterisk (*) to match multiple indices. Spaces and some characters are not allowed."
      >
        <EuiComboBox
          placeholder="Select or create options"
          options={formatFieldsToComboBox(indices)}
          selectedOptions={selectedIndexOptions}
          onChange={handleIndexOnChange}
        />
      </EuiFormRow>

    );
  }
  if (showIndexPatterns) {
    renderDataSource = (
      <EuiFormRow label="Index pattern">
        <EuiSelect
          id="indexpattern"
          options={indexPatterns.map((source) => ({
            value: source.id,
            text: source.title,
          }))}
          value={selectedIndexPattern}
          onChange={(e) => setSelectedIndexPattern(e.target.value)}
        />
      </EuiFormRow>
    );
  }

  const header = (
    <EuiFlexGroup justifyContent="spaceBetween">
      <EuiFlexItem grow={false}>
        <div>
          <EuiTitle>
            <h1 data-test-subj="createPitHeader">
              {<FormattedMessage id="pit.header" defaultMessage="Create point in time" />}
            </h1>
          </EuiTitle>
          <EuiSpacer size="s" />
          <EuiText>
            <p>
              <FormattedMessage
                id="pits.description"
                defaultMessage="A Point in Time (PIT) can be created from a single cluster with multiple indicies or a single index pattern."
              />
              <br />
            </p>
          </EuiText>
        </div>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  const datasource = (
    <EuiPageContent>
      <EuiTitle size="xs">
        <h4 data-test-subj="dataSourceHeader">
          {<FormattedMessage id="pit.datasource.header" defaultMessage="Data source" />}
        </h4>
      </EuiTitle>
      <EuiHorizontalRule />
      <EuiSpacer size="s" />
      {/* Title */}
      <EuiFormRow label="Cluster">
        <EuiSelect
          id="datasourcefilter"
          options={dataSources.map((source) => ({
            value: source.id,
            text: source.name,
          }))}
          value={dataSource}
          onChange={(e) => setDataSource(e.target.value)}
        />
      </EuiFormRow>
      <EuiFormRow>
        <EuiRadioGroup
          options={createOptions}
          idSelected={radioIdSelected}
          onChange={(id) => onRadioChange(id)}
          name="radio group"
        />
      </EuiFormRow>
      {renderDataSource}
    </EuiPageContent>
  );

  const expiration = (
    <EuiPageContent>
      <EuiTitle size="xs">
        <h4 data-test-subj="expiration">
          {<FormattedMessage id="pit.expiration.header" defaultMessage="Time configurations" />}
        </h4>
      </EuiTitle>

      <EuiHorizontalRule />

      <EuiSpacer size="s" />
      <EuiFlexGroup style={{ maxWidth: 800 }}>
        <EuiFlexItem>
          <EuiFormRow label="Keep alive">
            <EuiText size="xs">The keep_alive time is the time a PIT is active. When you query a PIT, you extend its expiration by the keep_alive time.  The keep_alive time cannot exceed X hours. 
            {' '}
      <EuiLink href="https://opensearch.org/docs/latest/search-plugins/point-in-time-api/#create-a-pit" target="_blank">
       Learn more
      </EuiLink>{' '}
            </EuiText>
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="l" />


      <EuiFlexGroup style={{ maxWidth: 800 }}>
        <EuiFlexItem>
          <EuiFormRow label="Hour(s)"
            helpText="PITs can only be extended to the max_keep_alive time."
          >
            <EuiFieldNumber value={hourValue}  min={0} max={23} placeholder="Hour(s)" onChange={onHourChange} />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow
            label="Min(s)"
          >
            <EuiFieldNumber value={minuteValue}  min={0} max={59} placeholder="Min(s)" onChange={onMinuteChange} />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="s" />

      <EuiHorizontalRule />

      <EuiSpacer size="s" />
      
    </EuiPageContent>
  );

  const details = (
    <EuiPageContent>
      <EuiTitle size="xs">
        <h4 data-test-subj="Details">
          {<FormattedMessage id="pit.details.header" defaultMessage="Dashboard PIT configurations" />}
        </h4>
      </EuiTitle>

      <EuiHorizontalRule />

      <EuiFormRow label="Dashboards availibility">
      <EuiText size="xs">To use this PIT in OpenSearch Dashboards, make it available to Dashboards.</EuiText>

      </EuiFormRow>
      <EuiSpacer size="l" />

      <EuiSwitch
          label="Make available in dashboards"
          checked={makedashboardschecked}
          onChange={oDashboardSwitchChange}
        />
      {makedashboardschecked && (
        <div>
        <EuiFlexGroup style={{ maxWidth: 800 }}>
          <EuiFlexItem>
            <EuiFormRow hasEmptyLabelSpace>
              <EuiFieldText disabled value="PIT-" />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFormRow
              label="Point in time name"
              helpText="Specify a unique and descriptive name that is easy to recognize."
            >
              <EuiFieldText placeholder="Descriptive name" onChange={onNameChange} />
            </EuiFormRow>
          </EuiFlexItem>
         
        </EuiFlexGroup>
        <EuiCheckbox
        id={'delete-pit-expiration'}
        label="Delete this dashboard object at expiration"
        checked={deletepitchecked}
        onChange={onDeletePitCheckboxChange}
      />
        </div>
        
      )}
    </EuiPageContent>
  );

  const additional_config = (
    <EuiPageContent>
      <EuiTitle size="xs">
        <h4 data-test-subj="Additional configurations">
          {<FormattedMessage id="pit.details.config" defaultMessage="Additional configuration options" />}
        </h4>
      </EuiTitle>

      <EuiHorizontalRule />

      <EuiFormRow label="Partial failures">
        <EuiCheckbox
          id={'partial-failures'}
          label="Create a PIT with partial failures"
          checked={partialfailurechecked}
          onChange={onPartialFailureCheckChange}
        />
      </EuiFormRow>
    </EuiPageContent>
  );

  const buttons = (
    <EuiFlexGroup direction="row" justifyContent="flexEnd">
      <EuiFlexItem grow={false}>
        <EuiButton onClick={() => history.push('')}>Cancel</EuiButton>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButton onClick={createPointInTime} fill={true} disabled={shouldCreateDisabled}>
          Create PIT
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  let formgroup;
  if (true) {
    formgroup = (
      <div>
        {header}
        <EuiSpacer size="m" />
        {datasource}
        <EuiSpacer size="s" />
        {expiration}
        <EuiSpacer size="s" />
        {details}
        <EuiSpacer size="s" />
        {additional_config}
        <EuiSpacer size="s" />
        {buttons}
      </div>
    );
  }

  return <div>{formgroup}</div>;
};

function useGeneratedHtmlId(arg0: { prefix: string }) {
  throw new Error('Function not implemented.');
}

export const CreatePitWithRouter = withRouter(PointInTimeCreateForm);
