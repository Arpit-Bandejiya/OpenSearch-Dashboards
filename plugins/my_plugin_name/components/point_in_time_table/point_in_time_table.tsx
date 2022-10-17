/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import {
    EuiBadge,
    EuiButtonEmpty,
    EuiFlexGroup,
    EuiFlexItem,
    EuiInMemoryTable,
    EuiSpacer,
    EuiText,
    EuiBadgeGroup,
    EuiPageContent,
    EuiTitle,
    EuiButton,
} from '@elastic/eui';
import {
    ChromeStart,
    ApplicationStart,
    IUiSettingsClient,
    OverlayStart,
    SavedObjectsStart,
    NotificationsStart,
    DocLinksStart,
    HttpSetup,
} from '../../../../src/core/public';
import { DataPublicPluginStart } from '../../../../src/plugins/data/public';
import { FormattedMessage } from '@osd/i18n/react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { i18n } from '@osd/i18n';
import {
    reactRouterNavigate,
    useOpenSearchDashboards,
} from '../../../../src/plugins/opensearch_dashboards_react/public';
import { PointInTimeFlyout } from '../point_in_time_flyout';
import { IndexPatternManagmentContext } from '../point_in_time_flyout/point_in_time_flyout';


const pagination = {
    initialPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
};

const sorting = {
    sort: {
        field: 'title',
        direction: 'asc' as const,
    },
};




const ariaRegion = i18n.translate('indexPatternManagement.editIndexPatternLiveRegionAriaLabel', {
    defaultMessage: 'Point in time',
});

const title = i18n.translate('indexPatternManagement.indexPatternTable.title', {
    defaultMessage: 'Point in time',
});



interface Props extends RouteComponentProps {
    canSave: boolean;
}

interface PointInTimeTableItem {
    id: string;
    title: string;
    default: boolean;
    tag?: string[];
    sort: string;
    keepAlive: string;
    source: string;
    creation: string;
    expiration: string;
}

interface PointInTimeManagmentContext {
    chrome: ChromeStart;
    application: ApplicationStart;
    savedObjects: SavedObjectsStart;
    uiSettings: IUiSettingsClient;
    notifications: NotificationsStart;
    overlays: OverlayStart;
    http: HttpSetup;
    docLinks: DocLinksStart;
    data: DataPublicPluginStart;
}

const item1: PointInTimeTableItem = {
    id: 'id1',
    title: 'pit1',
    default: false,
    sort: '0pit1',
    keepAlive: "24",
    source: "ind-1",
    creation: "24",
    expiration: "24"
};
const item2: PointInTimeTableItem = {
    id: 'id2',
    title: 'pit2',
    default: false,
    sort: '1pit2',
    keepAlive: "24",
    source: "ind-2",
    creation: "24",
    expiration: "24"
};

export async function getPits(savedObjects) {
    return savedObjects
    .find({
        type: 'point-in-time',
        perPage: 10000,
    }).then((response) =>
        response.savedObjects
            .map((pattern) => {
                console.log(pattern)
                const id = pattern.id;
                const name = pattern.get('name');
                const keepAlive = pattern.get('keepAlive');
                const source = pattern.references[0].name;
                const creation = pattern.updated_at;
                var date1 = new Date();
                var date2 = new Date(creation);
                var diff = new Date(date2.getTime() - date1.getTime());
                console.log(diff);
                var years = diff.getUTCFullYear() - 1970; // Gives difference as year
                var months = diff.getUTCMonth(); // Gives month count of difference
                var days = diff.getUTCDate()-1; // Gives day count of difference
                const expiration = diff.getUTCHours();
                return {
                    id,
                    title: name,
                    // the prepending of 0 at the default pattern takes care of prioritization
                    // so the sorting will but the default index on top
                    // or on bottom of a the table
                    sort: `${name}`,
                    default: false,
                    keepAlive: keepAlive,
                    source: source,
                    creation: creation,
                    expiration: expiration
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
    ) || [];
}
export const PointInTimeTable = ({ canSave, history }: Props) => {

    const [error, setError] = useState();
    const tableRef = useRef();
    const [pits, setPits] = useState([item1, item2]);
    const [selection, setSelection] = useState([]);
    const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
    const {
        setBreadcrumbs,
        savedObjects,
        uiSettings,
        chrome,
        docLinks,
        application,
        http,
        data,
    } = useOpenSearchDashboards<IndexPatternManagmentContext>().services;

    useEffect(() => {
        (async function () {
            const pits1:PointInTimeTableItem[] = await getPits(savedObjects.client);
            setPits(pits1);
            var names = gettedIndexPatterns.map(function (item) {
                return item['title'];
            });
            setIndexPatterns(gettedIndexPatterns);

            console.log(gettedIndexPatterns);
            setLoading(false);
        })();
    }, [
        savedObjects.client, isFlyoutVisible, 
    ]);

    // const renderToolsLeft = () => {
    //     if (selection.length === 0) {
    //         return;
    //     }

    //     const onClick = () => {
    //         //store.deleteUsers(...selection.map((user) => user.id));
    //         for(const id of selection) {
    //             const findIndex = pits.findIndex(a => a.id === id.id)

    //             findIndex !== -1 && pits.splice(findIndex , 1)
    //             setPits(pits);
    //             console.log(id);
    //         }
    //         setSelection([]);
    //     };

    //     return (
    //         <EuiButton color="danger" iconType="trash" onClick={onClick}>
    //             Delete {selection.length} point in time searches
    //         </EuiButton>
    //     );
    // };

    const renderToolsRight = () => {
        const onClick = () => {
            //store.deleteUsers(...selection.map((user) => user.id));
            for (const id of selection) {
                const findIndex = pits.findIndex(a => a.id === id.id)

                findIndex !== -1 && pits.splice(findIndex, 1)
                setPits(pits);
                console.log(id);
            }
            setSelection([]);
        };
        return (
            <EuiButton
                color="danger"
                iconType="trash"
                onClick={onClick}
                isDisabled={selection.length === 0}
            >
                Delete
            </EuiButton>
        );
        // return [
        //     <EuiButton
        //         key="loadUsers"
        //         onClick={() => {
        //             //loadUsers();
        //         }}
        //         isDisabled={selection.length === 0}
        //     >
        //         Load Users
        //     </EuiButton>,
        //     <EuiButton
        //         key="loadUsersError"
        //         onClick={() => {
        //             //loadUsersWithError();
        //         }}
        //         isDisabled={false}
        //     >
        //         Load Users (Error)
        //     </EuiButton>,
        // ];
    };

    const search = {
        toolsRight: renderToolsRight(),
        box: {
            incremental: true,
            schema: {
                fields: { title: { type: 'string' } },
            },
        },
    };



    const selectionValue = {
        selectable: () => true,
        selectableMessage: (selectable: any) =>
            !selectable ? 'User is currently offline' : undefined,
        onSelectionChange: (selection: any) => setSelection(selection),
        initialSelected: [],
    };

    // const {
    //     savedObjects,
    //     uiSettings,
    //     chrome,
    //     docLinks,
    //     application,
    //     http,
    //     data,
    // } = useOpenSearchDashboards<PointInTimeManagmentContext>().services;


    // useEffect(() => {

    // }, []);


    // const loadSources = () => {
    // };

    // useEffect(() => {
    // }, []);

    const columns = [
        {
            field: 'title',
            name: 'Name',
            render: (title: string, object: PointInTimeTableItem) => {

                return <span>{object.title}</span>;
            },
            dataType: 'string' as const,
            sortable: ({ sort }: { sort: string }) => sort,
        },
        {
            field: 'source',
            name: 'Source',
            render: (title: string, object: PointInTimeTableItem) => {

                return <span>{object.source}</span>;
            },
            dataType: 'string' as const
        },
        {
            field: 'keepalive',
            name: 'Keep alive',
            render: (title: string, object: PointInTimeTableItem) => {

                return <span>{object.keepAlive}</span>;
            },
            dataType: 'string' as const
        },
        {
            field: 'creation',
            name: 'Created at',
            render: (title: string, object: PointInTimeTableItem) => {

                return <span>{object.creation}</span>;
            },
            dataType: 'string' as const
        },
        {
            field: 'expiration',
            name: 'Expiration in',
            render: (title: string, object: PointInTimeTableItem) => {

                return <span>{object.expiration}</span>;
            },
            dataType: 'string' as const
        },
    ];

    // return (
    //     <EuiPageContent data-test-subj="pointInTimeTable" role="region" aria-label={ariaRegion}>
    //       <EuiFlexGroup justifyContent="spaceBetween">
    //         <EuiFlexItem grow={false}>
    //           <EuiTitle>
    //             <h2>{title}</h2>
    //           </EuiTitle>
    //           <EuiSpacer size="s" />
    //           <EuiText>
    //             <p>
    //               <FormattedMessage
    //                 id="indexPatternManagement.indexPatternTable.indexPatternExplanation"
    //                 defaultMessage="Create and manage point in time."
    //               />
    //             </p>
    //           </EuiText>
    //         </EuiFlexItem>
    //         <EuiFlexItem grow={false}><PointInTimeFlyout/></EuiFlexItem>
    //       </EuiFlexGroup>
    //       <EuiSpacer />
    //       <EuiInMemoryTable
    //             allowNeutralSort={false}
    //             itemId="id"
    //             isSelectable={true}
    //             items={pits}
    //             columns={columns1}
    //             pagination={pagination}
    //             sorting={sorting}
    //             search={search}
    //             selection={selectionValue}
    //         />
    //     </EuiPageContent>
    //   );


    return (
        <EuiPageContent data-test-subj="pointInTimeTable" role="region" aria-label={ariaRegion}>
            <EuiFlexGroup justifyContent="spaceBetween">
                <EuiFlexItem grow={false}>
                    <EuiTitle>
                        <h2>{title}</h2>
                    </EuiTitle>
                    <EuiSpacer size="s" />
                    <EuiText>
                        <p>
                            <FormattedMessage
                                id="indexPatternManagement.indexPatternTable.indexPatternExplanation"
                                defaultMessage="Create and manage the point in time searches that help you retrieve your data from OpenSearch."
                            />
                        </p>
                    </EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                    <PointInTimeFlyout setIsFlyoutVisible={setIsFlyoutVisible}/>
                </EuiFlexItem>

            </EuiFlexGroup>
            <EuiSpacer />
            <EuiInMemoryTable
                allowNeutralSort={false}
                itemId="id"
                isSelectable={true}
                items={pits}
                columns={columns}
                pagination={pagination}
                sorting={sorting}
                search={search}
                selection={selectionValue}
            />
        </EuiPageContent>
    );
};

export const PointInTimeTableWithRouter = withRouter(PointInTimeTable);
