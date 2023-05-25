/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { History } from 'history';
import { useEffectOnce, useMount } from 'react-use';
import {
  EuiButton,
  EuiInMemoryTable,
  EuiPageContent,
  EuiPageContentBody,
  EuiSpacer,
  EuiSearchBarProps,
  Query,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiTitle,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiBadge,
  EuiSelect,
  EuiConfirmModal,
  EuiFormRow,
  EuiFieldText,
  EuiFieldNumber,
  EuiModal,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
} from '@elastic/eui';
import { i18n } from '@osd/i18n';
import { FormattedMessage } from '@osd/i18n/react';
import moment, { now } from 'moment';
import { SavedObjectReference } from 'src/core/public';
import { getListBreadcrumbs } from '../breadcrumbs';
import { PointInTimeManagementContext } from '../../types';
import { useOpenSearchDashboards } from '../../../../opensearch_dashboards_react/public';
import {
  getDataSources,
  PointInTime,
  createSavedObject,
  getSavedPits,
  deletePointInTimeById,
  updatePointInTimeSavedObject,
  getPitSavedPitsByDataSource,
} from '../utils';
import { EmptyState, NoDataSourceState } from './empty_state';
// import { PageHeader } from './page_header';
import { getServices, Services } from '../../services';
import { CreateButton } from '../create_button';
// import { dataSource } from 'src/plugins/data_source/server/saved_objects';

export interface DataSourceItem {
  id: string;
  name: string;
  title: string;
  sort: string;
}

export interface DashboardPitItem {
  id: string;
  name: string;
  creation_time: number;
  keep_alive: number;
  delete_on_expiry: boolean;
}

export interface PitItem {
  pit_id: string;
  name: string;
  creation_time: number;
  keep_alive: number;
  dataSource: string;
  expiry: number;
}

const PITTable = (props: RouteComponentProps) => {
  const {
    setBreadcrumbs,
    savedObjects,
    notifications: { toasts },
    http,
  } = useOpenSearchDashboards<PointInTimeManagementContext>().services;

  const history: History = props.history;
  const dataSourceProp = props.location && props.location.state;

  useMount(() => {
    setBreadcrumbs(getListBreadcrumbs());
  });

  const createButton = <CreateButton history={history} dataTestSubj="createPitButton" />;

  const services: Services = getServices(http);

  // TODO: update this for cases when some data source name is default
  const defaultDataSource: DataSourceItem = { id: '', title: '', sort: '0', name: 'default' };

  // TODO: use APIs to fetch PITs and update the table and message
  const [loading, setLoading] = useState(false);
  const [pits, setPits] = useState<PitItem[]>([]);
  const [pitsToDelete, setPitsToDelete] = useState<PitItem[]>([]);
  const [pitToAddTime, setPitToAddTime] = useState<PitItem[]>([]);
  const [selectedPits, setSelectedPits] = useState<PitItem[]>([]);
  // const [dashboardPits, setDashboardPits] = useState<DashboardPitItem[]>([]);
  const [message, setMessage] = useState(<EmptyState history={history} />);

  const [dataSources, setDataSources] = useState<DataSourceItem[]>([defaultDataSource]);
  const [dataSource, setDataSource] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddTimeModalVisible, setIsAddTimeModalVisible] = useState(false);

  useEffectOnce(() => {
    fetchDataSources();
  });

  useEffect(() => {
    getPits(dataSource);
  }, [dataSource]);

  const fetchDataSources = () => {
    getDataSources(savedObjects.client)
      .then((fetchedDataSources) => {
        if (fetchedDataSources?.length) {
          setDataSources(
            fetchedDataSources
              .concat([defaultDataSource])
              .sort((a, b) => a.sort.localeCompare(b.sort))
          );
          console.log('dataSourceprop', dataSourceProp);
          const ds = dataSourceProp
            ? fetchedDataSources.filter((x) => x.id === dataSourceProp)[0].title
            : '';
          setDataSource(ds);
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

  const navigateEdit = (pit) => {
    console.log('editing', pit);
    const id = pit.id ? pit.id : 'edit';
    let dataSourceId;
    if (pit.dataSource === '') {
      dataSourceId = undefined;
    } else {
      const dataSource = dataSources.filter((x) => x.title === pit.dataSource);
      dataSourceId = dataSource[0].id;
    }

    pit.dataSourceId = dataSourceId;

    history.push(`${id}`, pit);
  };

  const getPits = (dataSourceId?: string) => {
    // setMessage(<>Loading PITs...</>);
    setLoading(true);
    console.log(dataSourceId);
    // let dataSourceId: string | undefined;
    const dataSourceName = dataSourceId;
    if (dataSourceId === '') {
      dataSourceId = undefined;
    } else if (dataSourceId === 'noDataSource') {
      // setMessage(<EmptyState/>);
      setLoading(false);
      setPits([]);
      return;
    } else {
      const dataSource = dataSources.filter((x) => x.title === dataSourceId);
      if (dataSource.length === 0) {
        toasts.addDanger(
          i18n.translate('pitManagement.pitTable.fetchDataSourceError', {
            defaultMessage: 'Unable to find data source',
          })
        );
        setMessage(<NoDataSourceState />);
        setPits([]);
        return;
      } else {
        dataSourceId = dataSource[0].id;
      }
    }
    setMessage(<EmptyState />);
    console.log(dataSourceId);

    services
      .getAllPits(dataSourceId)
      .then((fetchedPits) => {
        getPitSavedPitsByDataSource(savedObjects.client, dataSourceId ? dataSourceId : '')
          .then((fetchedDashboardPits) => {
            // if (fetchedDataSources?.length) {
            //   setDashboardPits(fetchedDataSources);
            // }
            console.log('dashboard pits', fetchedDashboardPits);
            setLoading(false);
            if (fetchedPits?.resp?.pits) {
              const expiredPits: DashboardPitItem[] = [];
              // if (dataSourceId === undefined) {
              //   expiredPits = fetchedDashboardPits.filter(
              //     (x) => !fetchedPits?.resp?.pits.some((x2) => x.attributes.id === x2.pit_id)
              //   );
              // }
              // console.log('expired', expiredPits);
              // expiredPits.filter(x=>x.attributes.delete_on_expiry).forEach(x=> {
              //   console.log('deleting ', x)
              //   deletePointInTimeById(savedObjects.client, x.id);
              // })

              if (dataSourceId === undefined) {
                fetchedDashboardPits.forEach((x) => {
                  if (!fetchedPits?.resp?.pits.some((x2) => x.attributes.pit_id === x2.pit_id)) {
                    if (x.attributes.delete_on_expiry) {
                      console.log('deleting ', x);
                      deletePointInTimeById(savedObjects.client, x.id);
                    } else {
                      expiredPits.push(x);
                    }
                  }
                });
              }
              console.log('expired', expiredPits);

              setPits(
                fetchedPits?.resp?.pits
                  .map((val) => {
                    const date = moment(val.creation_time);
                    const formattedDate = date.format('MMM D @ HH:mm:ss');
                    const expiry = val.creation_time + val.keep_alive;
                    const dashboardPit = fetchedDashboardPits.filter(
                      (x) => x.attributes.pit_id === val.pit_id
                    );
                    if (dashboardPit.length > 0) {
                      console.log(dashboardPit);
                      dashboardPit[0].attributes.keepAlive = val.keep_alive;
                      console.log('updating', dashboardPit);
                      updatePointInTimeSavedObject(
                        savedObjects.client,
                        dashboardPit[0].id,
                        dashboardPit[0].attributes,
                        dashboardPit[0].references
                      );
                      return {
                        pit_id: val.pit_id,
                        id: dashboardPit[0].id,
                        name: dashboardPit[0].attributes.name,
                        creation_time: val.creation_time,
                        keep_alive: val.keep_alive,
                        dataSource: dataSourceName,
                        isSavedObject: true,
                        expiry,
                      };
                    }
                    return {
                      pit_id: val.pit_id,
                      id: val.id,
                      name: formattedDate,
                      creation_time: val.creation_time,
                      keep_alive: val.keep_alive,
                      dataSource: dataSourceName,
                      isSavedObject: false,
                      expiry,
                    };
                  })
                  .concat(
                    expiredPits.map((x) => ({
                      pit_id: x.attributes.pit_id,
                      name: x.attributes.name,
                      id: x.id,
                      creation_time: x.attributes.creation_time,
                      keep_alive: x.attributes.keepAlive,
                      dataSource: dataSourceName,
                      isSavedObject: true,
                      expiry: x.attributes.creation_time + x.attributes.keepAlive,
                    }))
                  )
              );
            }

            console.log(fetchedPits?.resp?.pits as PitItem[]);
            console.log(pits.length);
          })
          .catch(() => {
            toasts.addDanger(
              i18n.translate('pitManagement.pitTable.fetchPitError', {
                defaultMessage: 'Unable to load existing dashboard PITs',
              })
            );
          });
      })
      .catch(() => {
        setLoading(false);
        toasts.addDanger(
          i18n.translate('pitManagement.pitTable.fetchDataSourceError', {
            defaultMessage: 'Unable to fetch point in time objects.',
          })
        );
      });
  };

  const createPointInTime = () => {
    // setIsFlyoutVisible(false);
    const pit: PointInTime = {
      pit_id:
        'o463QQEKbXktaW5kZXgtMRZqUlZFU2lSaFE1eUx0cHdiSjNLWjRRABZtWjNCdk1ZdFRZbS1JbnltaVlBTWdBAAAAAAAAAACGFlJXLVVNYXVQVFctQVIxVmh1OUJuSlEBFmpSVkVTaVJoUTV5THRwd2JKM0taNFEAAA==',
      keepAlive: 30000000,
      creation_time: 1684418768188,
      name: 'PIT-my-index-1223', // Todo create pit and fill the pit id
      delete_on_expiry: false,
    };

    const reference: SavedObjectReference = {
      id: 'ff959d40-b880-11e8-a6d9-e546fe2bba5f',
      type: 'index-pattern',
      name: 'opensearch_dashboards_sample_data_ecommerce',
    };
    createSavedObject(pit, savedObjects.client, reference);
  };

  const getBackendPits = () => {
    getSavedPits(savedObjects.client).then((fetchedDashboardPits) => {
      console.log(fetchedDashboardPits);
    });
  };

  const deletePit = (pit) => {
    let dataSourceId: string | undefined = '';
    if (dataSource === '') {
      dataSourceId = undefined;
    } else {
      const dataSourceObj = dataSources.filter((x) => x.title === dataSource);
      if (dataSourceObj.length === 0) {
        toasts.addDanger(
          i18n.translate('pitManagement.pitTable.fetchDataSourceError', {
            defaultMessage: 'Unable to find data source',
          })
        );
        setMessage(<NoDataSourceState />);
        setPits([]);
        return;
      } else {
        dataSourceId = dataSourceObj[0].id;
      }
    }
    services.deletePits([pit.pit_id], dataSourceId).then((deletedPits) => {
      console.log(deletedPits);
      if (pit.isSavedObject) {
        deletePointInTimeById(savedObjects.client, pit.id).then(() => {
          getPits(dataSource);
        });
      } else {
        getPits(dataSource);
      }
    });
  };

  const DeleteModal = ({}) => {
    const closeModal = () => {
      setIsModalVisible(false);
    };

    const [value, setValue] = useState('');
    const onChange = (e) => {
      setValue(e.target.value);
      console.log(pitsToDelete[0]);
    };

    let modal;

    if (isModalVisible) {
      const expired = moment(pitsToDelete[0].expiry).isBefore(now());
      if (expired) {
        modal = (
          <EuiConfirmModal
            title="Delete PIT?"
            onCancel={closeModal}
            onConfirm={() => {
              closeModal();
              deletePit(pitsToDelete[0]);
              setPitsToDelete([]);
            }}
            confirmButtonText="Delete PIT"
            cancelButtonText="Cancel"
            buttonColor="danger"
          >
            <EuiText>The PIT will be permanently deleted. This action is irreversible.</EuiText>
            <EuiSpacer />
          </EuiConfirmModal>
        );
      } else {
        modal = (
          <EuiConfirmModal
            title="Delete PIT?"
            onCancel={closeModal}
            onConfirm={() => {
              closeModal();
              deletePit(pitsToDelete[0]);
              setPitsToDelete([]);
            }}
            confirmButtonText="Delete PIT"
            cancelButtonText="Cancel"
            buttonColor="danger"
            confirmButtonDisabled={value !== pitsToDelete[0].name}
          >
            <EuiText>
              This is an active PIT. Deleting it will permanently remove data and may cause
              unexpected behavior in saved objects that use this PIT. This action is irreversible.
            </EuiText>
            <EuiSpacer />
            <EuiFormRow label={'Type "' + pitsToDelete[0].name + '" to confirm'}>
              <EuiFieldText name="delete" value={value} onChange={onChange} />
            </EuiFormRow>
          </EuiConfirmModal>
        );
      }
    }

    return <div>{modal}</div>;
  };

  const AddTimeModal = ({}) => {
    const closeModal = () => {
      setIsAddTimeModalVisible(false);
    };

    const [addTimeHr, setAddTimeHr] = useState(0);
    const [addTimeMin, setAddTimeMin] = useState(0);
    const [addTime, setAddTime] = useState(0);

    const onChangeTimeHr = (e) => {
      setAddTimeHr(parseInt(e.target.value));
      setAddTime(60 * parseInt(e.target.value) + addTimeMin);
    };

    const onChangeTimeMin = (e) => {
      setAddTimeMin(parseInt(e.target.value));
      setAddTime(60 * addTimeHr + parseInt(e.target.value));
    };

    const addTimeToPit = (pit) => {
      console.log(addTime);
      console.log('add time pit', pit);
      const new_keep_alive_proposal = addTime.toString() + 'm';
      const ds =
        pit.dataSource == ''
          ? undefined
          : dataSources.filter((x) => x.title === pit.dataSource)[0].id;
      services
        .addPitTime(pit.pit_id, new_keep_alive_proposal, ds)
        .then(() => getPits(pit.dataSource))
        .catch(() => {
          toasts.addDanger(
            i18n.translate('pitManagement.pitTable.addTimeError', {
              defaultMessage: 'Error while updating PIT object.',
            })
          );
        });
    };

    let modal;

    if (isAddTimeModalVisible) {
      const maxTime = moment(pitToAddTime[0].expiry).diff(
        moment(pitToAddTime[0].creation_time),
        'hours'
      );
      console.log('maxTime', maxTime);
      const maxTimeExceeded = maxTime >= 24;
      if (maxTimeExceeded) {
        modal = (
          <EuiModal title="Maximum time reached" onClose={closeModal}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>Maximum time reached</EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
              <EuiText>
                A PIT can be kept for a maximum of 24 hours. You cannot add more time to this PIT.
                To extend the time, configure point_in_time.max_keep_alive or contact your
                administrator.
              </EuiText>
              <EuiSpacer />
            </EuiModalBody>
            <EuiModalFooter>
              <EuiButton onClick={closeModal} fill>
                Cancel
              </EuiButton>
            </EuiModalFooter>
          </EuiModal>
        );
      } else {
        modal = (
          <EuiConfirmModal
            title="Add Time"
            onCancel={closeModal}
            onConfirm={() => {
              closeModal();
              addTimeToPit(pitToAddTime[0]);
              setPitToAddTime([]);
            }}
            confirmButtonText="Add time to PIT"
            cancelButtonText="Cancel"
          >
            <EuiText>
              Add an amount of time to a PIT. This amount must be greater than the keep_alive time
              (x) and cannot exceed the max_keep_alive time (y). You can configure keep_alive on the
              PIT object details page.
            </EuiText>
            <EuiSpacer />
            <EuiFormRow>
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiFieldNumber placeholder="Hour(s)" onChange={onChangeTimeHr} />
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFieldNumber placeholder="Min(s)" onChange={onChangeTimeMin} />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFormRow>
          </EuiConfirmModal>
        );
      }
    }

    return <div>{modal}</div>;
  };

  const displayDelete = (pit) => {
    setPitsToDelete([pit]);
    setIsModalVisible(true);
  };

  const displayAddTime = (pit) => {
    setPitToAddTime([pit]);
    setIsAddTimeModalVisible(true);
  };

  const actions = [
    {
      name: 'Add Time',
      description: 'Add Time',
      icon: 'clock',
      type: 'icon',
      onClick: displayAddTime,
    },
    {
      name: 'Configure PIT',
      description: 'Configure PIT',
      icon: 'pencil',
      type: 'icon',
      onClick: navigateEdit, // route it to edit page --> create a route page
    },
    {
      name: 'Delete',
      description: 'Delete PIT',
      icon: 'trash',
      type: 'icon',
      color: 'danger',
      onClick: displayDelete,
    },
  ];

  const Timer = ({ endTime }) => {
    const getTime = () =>
      moment(endTime).isBefore(now()) ? 'Expired' : '~ ' + moment(endTime).fromNow(true);

    const getBadgeColor = () => {
      const timeLeft = endTime - moment.now().valueOf();
      if (timeLeft < 0) {
        return 'hollow';
      } else if (timeLeft < 10 * 60 * 1000) {
        return 'danger';
      } else {
        return 'default';
      }
    };

    const [time, setTime] = useState<string>(() => getTime());
    const [badge, setBadge] = useState(() => getBadgeColor());

    const updateTime = () => {
      setInterval(() => {
        setTime(() => getTime());
        setBadge(() => getBadgeColor());
      }, 30000);
    };

    useEffectOnce(updateTime);

    return <EuiBadge color={badge}>{time}</EuiBadge>;
  };

  const columns = [
    {
      field: 'name',
      name: i18n.translate('pitManagement.pitTable.nameColumnName', {
        defaultMessage: 'Name',
      }),
    },
    {
      field: 'expiry',
      name: i18n.translate('pitManagement.pitTable.expiresColumnName', {
        defaultMessage: 'Expires',
      }),
      render: (t: number) => {
        // return prettyDuration(moment(t).format('YYYY-MM-DDTHH:mm:ss'),'now',[], 'MMMM Do YYYY, HH:mm:ss.SSS')
        return <Timer endTime={t} />;
      },
      sortable: true,
    },
    {
      field: 'dataSource',
      name: i18n.translate('pitManagement.pitTable.dataSourceColumnName', {
        defaultMessage: 'Data Source',
      }),
      render: (t: string) => {
        // return prettyDuration(moment(t).format('YYYY-MM-DDTHH:mm:ss'),'now',[], 'MMMM Do YYYY, HH:mm:ss.SSS')
        return t === '' ? 'default' : t;
      },
    },
    {
      field: 'creation_time',
      name: i18n.translate('pitManagement.pitTable.createdColumnName', {
        defaultMessage: 'Created',
      }),
      render: (t: number) => {
        const date = moment(t);
        const formattedDate = date.format('MMM D, YYYY HH:mm:ss');
        return formattedDate;
      },
      sortable: true,
    },
    {
      name: i18n.translate('pitManagement.pitTable.actionsColumnName', {
        defaultMessage: 'Actions',
      }),
      actions,
    },
  ];

  const handleDeletePit = () => {
    let dataSourceId: string | undefined = '';
    if (dataSource === '') {
      dataSourceId = undefined;
    } else {
      const dataSourceObj = dataSources.filter((x) => x.title === dataSource);
      if (dataSourceObj.length === 0) {
        toasts.addDanger(
          i18n.translate('pitManagement.pitTable.fetchDataSourceError', {
            defaultMessage: 'Unable to find data source',
          })
        );
        setMessage(<NoDataSourceState />);
        setPits([]);
        return;
      } else {
        dataSourceId = dataSourceObj[0].id;
      }
    }

    services
      .deletePits(
        selectedPits.map((x) => x.pit_id),
        dataSourceId
      )
      .then((deletedPits) => {
        console.log(deletedPits);
        getPits(dataSource);
      });

    selectedPits.forEach((x) => {
      if (x.isSavedObject) {
        deletePointInTimeById(savedObjects.client, x.id);
      }
    });
  };

  const renderToolsRight = () => {
    return [
      <EuiButton
        iconType="trash"
        key="deletePit"
        isDisabled={selectedPits.length === 0}
        data-test-subj="deletePITBtnInPitTable"
        onClick={handleDeletePit}
      >
        <FormattedMessage id="pitManagement.pitTable.deletePitButton" defaultMessage="Delete" />
      </EuiButton>,
    ];
  };

  const renderToolsLeft = () => {
    return [
      <EuiSelect
        id="selectDocExample"
        options={dataSources.map((source) => ({
          value: source.title,
          text: source.name,
        }))}
        value={dataSource}
        onChange={(e) => setDataSource(e.target.value)}
      />,
    ];
  };

  // function onQueryChange({ query }: { query: Query }) {
  //   if (query.ast.getFieldClauses('dataSource')) {
  //     const selectedDataSource = query.ast.getFieldClauses('dataSource')[0].value as string;
  //     setDataSource(selectedDataSource);
  //   } else {
  //     setMessage(<NoDataSourceState />);
  //     setDataSource('noDataSource');
  //   }
  // }

  const search: EuiSearchBarProps = {
    toolsLeft: renderToolsLeft(),
    toolsRight: renderToolsRight(),
    // defaultQuery: 'dataSource:""',
    // onChange: onQueryChange,
    box: {
      incremental: true,
      schema: true,
      disabled: pits.length === 0,
    },
    // filters: [
    //   {
    //     type: 'field_value_selection',
    //     searchThreshold: 5,
    //     field: 'dataSource',
    //     name: i18n.translate('pitManagement.pitTable.dataSourceFilterName', {
    //       defaultMessage: 'Data Source',
    //     }),
    //     multiSelect: false,
    //     options: dataSources.map((source) => ({
    //       value: source.title,
    //       name: source.name,
    //       view: `${source.title}`,
    //     })),
    //   },
    // ],
  };

  const onSelectionChange = (selected: PitItem[]) => {
    setSelectedPits(selected);
  };

  const selection = {
    onSelectionChange,
  };

  const pagination = {
    initialPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
  };

  const PageHeader = () => {
    const [refreshTime, setRefreshTime] = useState<number>(moment.now());
    const [timeSinceRefresh, setTimeSinceRefresh] = useState<string>(
      moment(refreshTime).fromNow(true)
    );

    const handleClick = () => {
      getPits(dataSource);
      setRefreshTime(moment.now());
    };

    const updateTimeSinceRefresh = () => {
      setInterval(() => {
        setTimeSinceRefresh(moment(refreshTime).fromNow(true));
      }, 30000);
    };

    useEffectOnce(updateTimeSinceRefresh);

    return (
      <>
        <EuiPageContentHeader>
          <EuiPageContentHeaderSection>
            <EuiTitle>
              <h1>
                <FormattedMessage
                  id="pitManagement.header.pitTitle"
                  defaultMessage="Point in Time"
                />
              </h1>
            </EuiTitle>
          </EuiPageContentHeaderSection>
          <EuiFlexGroup alignItems="center" justifyContent="flexEnd" gutterSize="s">
            <EuiFlexItem grow={false}>
              <EuiText>Last updated {timeSinceRefresh} ago</EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                iconType="refresh"
                data-test-subj="refreshPITBtnInHeader"
                onClick={handleClick}
              >
                <FormattedMessage
                  id="pitManagement.header.refreshPitButton"
                  defaultMessage="Refresh"
                />
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>{createButton}</EuiFlexItem>
          </EuiFlexGroup>
        </EuiPageContentHeader>
        <EuiText size="s">
          <p>
            <FormattedMessage
              id="pitManagement.pitDescription"
              defaultMessage="Create and manage point in time objects."
            />
          </p>
        </EuiText>
      </>
    );
  };

  return (
    <>
      <EuiPageContent
        className="pitTable"
        horizontalPosition="center"
        data-test-subj="pointInTimeTable"
      >
        <PageHeader
        // handleRefresh={getPits(dataSource)}
        />
        <EuiSpacer size="m" />
        <EuiPageContentBody>
          <EuiInMemoryTable
            items={pits}
            itemId="pit_id"
            loading={loading}
            message={message}
            columns={columns}
            search={search}
            pagination={pagination}
            sorting={true}
            isSelectable={true}
            selection={selection}
          />
          <DeleteModal />
          <AddTimeModal />
        </EuiPageContentBody>
      </EuiPageContent>
      {/* <EuiButton onClick={createPointInTime}>Create PIT</EuiButton>
      <EuiButton onClick={getBackendPits}>Get PITs</EuiButton> */}
    </>
  );
};

export const PITTableWithRouter = withRouter(PITTable);
