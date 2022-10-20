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
// import { IIndexPattern } from 'src/plugins/data/public';
// import { useOpenSearchDashboards } from '../../../../src/plugins/opensearch_dashboards_react/public';

export interface PointInTimeFlyoutItem {
    id: string;
    title: string;
    sort: string;
};
// export async function getIndexPatterns(
//     savedObjectsClient
// ) {
//     return (
//         savedObjectsClient
//             .find({
//                 type: 'index-pattern',
//                 fields: ['title', 'type'],
//                 perPage: 10000,
//             })
//             .then((response) =>
//                 response.savedObjects
//                     .map((pattern) => {
//                         const id = pattern.id;
//                         const title = pattern.get('title');


//                         return {
//                             id,
//                             title,
//                             // the prepending of 0 at the default pattern takes care of prioritization
//                             // so the sorting will but the default index on top
//                             // or on bottom of a the table
//                             sort: `${title}`,
//                         };
//                     })
//                     .sort((a, b) => {
//                         if (a.sort < b.sort) {
//                             return -1;
//                         } else if (a.sort > b.sort) {
//                             return 1;
//                         } else {
//                             return 0;
//                         }
//                     })
//             ) || []
//     );
// }

export const PointInTimeFlyout = async () => {

    const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [value, setValue] = useState('24');
    const [checked, setChecked] = useState(false);
   // const [indexPatterns, setIndexPatterns] = useState([] as PointInTimeFlyoutItem[]);
    const onChange = (e) => {
        setValue(e.target.value);
    };

    // const {
    //     savedObjects,
    // } = useOpenSearchDashboards().services;

    // useEffect(() => {
    //     (async function () {
    //         const gettedIndexPatterns: PointInTimeFlyoutItem[] = await getIndexPatterns(
    //             savedObjects.client
    //         );
    //         setIndexPatterns(gettedIndexPatterns);
            
    //         console.log(gettedIndexPatterns);
    //     })();
    // } , [
    //     savedObjects.client,
    //   ]);



    const renderBody = ({ data, isLoading, hasPrivilegeToRead }: any) => {
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


        const onCheckboxChange = (e) => {
            setChecked(e.target.checked);
        };
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
                        options={[
                            { value: 'option_one', text: 'Option one' },
                            { value: 'option_two', text: 'Option two' },
                            { value: 'option_three', text: 'Option three' },
                        ]}
                        isInvalid={showErrors}
                    />
                </EuiFormRow>
                <EuiFormRow label="Custom Point in time name" isInvalid={showErrors} fullWidth>
                    <EuiFieldText fullWidth name="name" isInvalid={showErrors} />
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
                        value={value}
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
                        <EuiButton onClick={() => setIsFlyoutVisible(false)} fill>
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
            {flyout}
        </div>
    );
};

function useGeneratedHtmlId(arg0: { prefix: string; }) {
    throw new Error('Function not implemented.');
}

