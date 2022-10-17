import React, { Component, Fragment, ReactNode, useEffect, useState } from 'react';
import { take, get as getField } from 'lodash';
import {
    EuiFlyout,
    EuiFlyoutBody,
    EuiFlyoutFooter,
    EuiFlyoutHeader,
    EuiButtonEmpty,
    EuiButton,
    EuiText,
    EuiTitle,
    EuiForm,
    EuiFormRow,
    EuiFilePicker,
    EuiInMemoryTable,
    EuiSelect,
    EuiFlexGroup,
    EuiFlexItem,
    EuiLoadingSpinner,
    EuiCallOut,
    EuiSpacer,
    EuiLink,
    EuiCodeBlock,
    EuiFieldText,
    EuiTextArea,
    EuiRange,
    EuiCheckbox,
    EuiFormLabel,
} from '@elastic/eui';
import { i18n } from '@osd/i18n';
import { FormattedMessage } from '@osd/i18n/react';
import { useOpenSearchDashboards } from '../../../../src/plugins/opensearch_dashboards_react/public';
import { ChromeStart, ApplicationStart, SavedObjectsStart, NotificationsStart, OverlayStart, HttpSetup, DocLinksStart } from 'opensearch-dashboards/public';
import { IUiSettingsClient } from 'opensearch-dashboards/server';
import { DataPublicPluginStart } from 'src/plugins/data/public';
import { ManagementAppMountParams } from 'src/plugins/management/public';
import { CoreStart, HttpFetchError } from 'opensearch-dashboards/public';
import {CREATE_POINT_IN_TIME_PATH} from "../../common";
import { RouteComponentProps } from 'react-router-dom';

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
};

export interface PointInTimeFlyoutItem {
    id: string;
    title: string;
    sort: string;
};
export interface SavedObjectReference {
    name?: string;
    id: string;
    type: string;
}
export interface PointInTime {
    name: string,
    keepAlive: string,
    id: string
}
export async function getIndexPatterns(savedObjectsClient) {
    return (
        savedObjectsClient
            .find({
                type: 'index-pattern',
                fields: ['title', 'type'],
                perPage: 10000,
            })
            .then((response) =>
                response.savedObjects
                    .map((pattern) => {
                        const id = pattern.id;
                        const title = pattern.get('title');


                        return {
                            id,
                            title,
                            // the prepending of 0 at the default pattern takes care of prioritization
                            // so the sorting will but the default index on top
                            // or on bottom of a the table
                            sort: `${title}`,
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

export async function getPits(client, title: string) {
    if (title) {
        const savedObjects = await client.find({
            type: 'point-in-time',
            perPage: 1000,
            fields: ['id']
        });

        return savedObjects.savedObjects;
    }
}


export async function findByTitle(client, title: string) {
    if (title) {
        const savedObjects = await client.find({
            type: 'point-in-time',
            perPage: 1000,
            fields: ['id']
        });

        return savedObjects.savedObjects.find((obj) => obj.attributes.id.toLowerCase() === title.toLowerCase());
    }
}


interface Props extends RouteComponentProps {
    setIsFlyoutVisible: (isFlyoutVisible: boolean) => void;
}
export const PointInTimeFlyout = (props:Props) => {

    const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [keepAlive, setKeepAlive] = useState('24');
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(true);

    const [indexPatterns, setIndexPatterns] = useState([] as PointInTimeFlyoutItem[]);
    const[selectedIndexPattern, setSelectedIndexPattern] = useState("");
    const[pitName, setPitName] = useState("");

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

    const onChange = (e) => {
        setKeepAlive(e.target.value);
    };
    const onDropDownChange = (e) => {
        setSelectedIndexPattern(e.target.value);
    }
    console.log(useOpenSearchDashboards().services);
    console.log(savedObjects);
    useEffect(() => {
        (async function () {
            const gettedIndexPatterns: PointInTimeFlyoutItem[] = await getIndexPatterns(
                savedObjects.client
            );
            var names = gettedIndexPatterns.map(function (item) {
                return item['title'];
            });
            setIndexPatterns(gettedIndexPatterns);
            setSelectedIndexPattern(gettedIndexPatterns[0].id);
            console.log(gettedIndexPatterns);
            setLoading(false);
        })();
    }, [
        savedObjects.client,
    ]);

    const createPointInTime = async () => {
      console.log('keep alive :' + keepAlive);
      console.log("name : " + pitName);
      console.log("index pattern : " + selectedIndexPattern);
      setLoading(true);
      const pattern = indexPatterns.find((r)=>r.id);

      //setIsFlyoutVisible(false);
      const index = pattern.title
      const response = await http.post(`${CREATE_POINT_IN_TIME_PATH}/${index}`);
      const pit:PointInTime = {
            name: pitName,
            keepAlive: keepAlive,
            id: response.pit_id // Todo create pit and fill the pit id
        }

        const reference:SavedObjectReference = {
            id: pattern.id,
            type: 'index-pattern',
            name: pattern.title
        }
        createSavedObject(pit, savedObjects.client,reference, http)
    }

    async function createSavedObject(pointintime, client, reference,) {
        const dupe = await findByTitle(client, pointintime.id);
        console.log(dupe);
        if(dupe) {
            throw new Error(`Duplicate Point in time: ${pointintime.id}`);
        }
        // if (dupe) {
        //     if (override) {
        //         await this.delete(dupe.id);
        //     } else {
        //         throw new DuplicateIndexPatternError(`Duplicate index pattern: ${indexPattern.title}`);
        //     }
        // }
    
        const body = pointintime;
        const references = [{...reference}];
        const savedObjectType = "point-in-time";
        const response = await client.create(savedObjectType, body, {
            id: pointintime.id,
            references,
        });
        console.log(response);
        pointintime.id = response.id;
        setLoading(false);
        setIsFlyoutVisible(false);
        props.setIsFlyoutVisible(true);
        return pointintime;
    }


    // useEffect(() => {
    //     const gettedIndexPatterns: PointInTimeFlyoutItem[] = getIndexPatterns(
    //                     savedObjects.client
    //                 );

    //                 console.log(gettedIndexPatterns);
    // });
    const renderBody = ({ data, isLoading, hasPrivilegeToRead }: any) => {
        console.log(savedObjects);
        if (isLoading) {
            return (
                <EuiFlexGroup justifyContent="spaceAround">
                    <EuiFlexItem grow={false}>
                        <EuiLoadingSpinner size="xl" />
                    </EuiFlexItem>
                </EuiFlexGroup>
            );
        }

        if (!hasPrivilegeToRead) {
            return (
                <EuiCallOut
                    title={
                        <FormattedMessage
                            id="telemetry.callout.errorUnprivilegedUserTitle"
                            defaultMessage="Error displaying cluster statistics"
                        />
                    }
                    color="danger"
                    iconType="cross"
                >
                    <FormattedMessage
                        id="telemetry.callout.errorUnprivilegedUserDescription"
                        defaultMessage="You do not have access to see unencrypted cluster statistics."
                    />
                </EuiCallOut>
            );
        }

        if (data === null) {
            return (
                <EuiCallOut
                    title={
                        <FormattedMessage
                            id="telemetry.callout.errorLoadingClusterStatisticsTitle"
                            defaultMessage="Error loading cluster statistics"
                        />
                    }
                    color="danger"
                    iconType="cross"
                >
                    <FormattedMessage
                        id="telemetry.callout.errorLoadingClusterStatisticsDescription"
                        defaultMessage="An unexpected error occured while attempting to fetch the cluster statistics.
                  This can occur because OpenSearch failed, OpenSearch Dashboards failed, or there is a network error.
                  Check OpenSearch Dashboards, then reload the page and try again."
                    />
                </EuiCallOut>
            );
        }


        const onButtonClick = () => {
            setShowErrors(!showErrors);
        };

        // const button = (
        //     <EuiButton fill color="danger" onClick={onButtonClick}>
        //         Toggle errors
        //     </EuiButton>
        // );

        const onTextChange = (e) => {
            setPitName(e.target.value);
        }
        const onCheckboxChange = (e) => {
            setChecked(e.target.checked);
        };
        const onDropDownChange = (e) => {
            setSelectedIndexPattern(e.target.value);
        }
        let errors;
        return <Fragment>
            <EuiForm isInvalid={showErrors} error={errors} component="form">
                <EuiFormRow isInvalid={showErrors} fullWidth>
                    <EuiText>
                        <p>
                            Create point in time search based on existing index pattern
                        </p>
                    </EuiText>
                </EuiFormRow>

                <EuiFormRow label="Data source" isInvalid={showErrors} fullWidth>
                    <EuiSelect
                        fullWidth
                        options={(indexPatterns).map((option) => {
                            return {
                                text: option.title,
                                value: option.id,
                            };
                        })}
                        isInvalid={showErrors}
                        isLoading={loading}
                        value={selectedIndexPattern}
                        onChange={onDropDownChange}
                    />
                </EuiFormRow>
                <EuiFormRow label="Custom Point in time name" isInvalid={showErrors} fullWidth>
                    <EuiFieldText fullWidth name="name" isInvalid={showErrors} onChange={onTextChange} />
                </EuiFormRow>

                <EuiFormRow
                    label="Expiration in"
                    isInvalid={showErrors}
                    fullWidth
                >
                    <EuiRange
                        // min={100}
                        max={24}
                        step={0.05}
                        fullWidth
                        value={keepAlive}
                        onChange={onChange}
                        showLabels
                        showValue
                        aria-label="An example of EuiRange with showLabels prop"
                    />
                </EuiFormRow>

                <EuiFormRow isInvalid={showErrors} fullWidth>
                    <EuiCheckbox
                        id="checkbox"
                        label="The PIT will be automatically deleted at the expiry time"
                        checked={checked}
                        onChange={(e) => onCheckboxChange(e)}
                    />
                </EuiFormRow>


                <EuiSpacer />

                {/* {button} */}
            </EuiForm>
        </Fragment>

        //return <EuiCodeBlock language="js">{JSON.stringify(data, null, 2)}</EuiCodeBlock>;
    }

    let flyout;
    if (isFlyoutVisible) {
        flyout = (<EuiFlyout ownFocus onClose={() => setIsFlyoutVisible(false)} size="m" paddingSize="m" >
            <EuiFlyoutHeader hasBorder>
                <EuiTitle size="m">
                    <h2>
                        <FormattedMessage
                            id="savedObjectsManagement.objectsTable.flyout.importSavedObjectTitle"
                            defaultMessage="Create point in time"
                        />
                    </h2>
                </EuiTitle>
            </EuiFlyoutHeader>

            <EuiFlyoutBody>
                {renderBody({ data: "", isLoading: false, hasPrivilegeToRead: true })}
            </EuiFlyoutBody>
            <EuiFlyoutFooter>
                <EuiFlexGroup justifyContent="spaceBetween">
                    <EuiFlexItem grow={false}>
                        <EuiButtonEmpty
                            iconType="cross"
                            onClick={() => setIsFlyoutVisible(false)}
                            flush="left"
                        >
                            Close
                        </EuiButtonEmpty>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                        <EuiButton onClick={createPointInTime} fill isLoading={loading}>
                            Save
                        </EuiButton>
                    </EuiFlexItem>
                </EuiFlexGroup>
            </EuiFlyoutFooter>
            {/* <EuiFlyoutFooter>{renderFooter()}</EuiFlyoutFooter> */}
            {/* {confirmOverwriteModal} */}
        </EuiFlyout>);
    }

    return (
        <div>
            <EuiButton
                onClick={() => setIsFlyoutVisible(true)}
                iconType="plusInCircle"
                fill={true}
            >
                Create point in time
            </EuiButton>
            {isFlyoutVisible && flyout}
        </div>
    );
};

function useGeneratedHtmlId(arg0: { prefix: string; }) {
    throw new Error('Function not implemented.');
}

