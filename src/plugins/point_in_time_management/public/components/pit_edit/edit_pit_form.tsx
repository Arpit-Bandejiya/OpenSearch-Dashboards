/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import {
  EuiBottomBar,
  EuiButton,
  EuiButtonEmpty,
  EuiCheckbox,
  EuiDescribedFormGroup,
  EuiFieldNumber,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiPageContent,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiSpacer,
  EuiSwitch,
  EuiTitle,
} from '@elastic/eui';
import { i18n } from '@osd/i18n';
import { PointInTimeAttributes, ToastMessageItem } from '../../types';
import { findById } from '../utils';

export interface EditPitProps {
  existingPointInTime: PointInTimeAttributes;
  handleSubmit: (formValues: PointInTimeAttributes) => void;
  displayToastMessage: (info: ToastMessageItem) => void;
  newProp: boolean;
}

export interface EditPitState {
  keepAlive: number;
  name: string;
  pit_id?: string;
  id?: string;
  delete_pit: boolean;
  showUpdateOptions: boolean;
  isLoading: boolean;
  checked: boolean;
  AddTimeHr: any;
  AddTimeMin: any;
  addTime: any;
  isSavedObject: any;
  makedashboardschecked: boolean;
  creation_time?: number;
}

export class EditPitForm extends React.Component<EditPitProps, EditPitState> {
  constructor(props: EditPitProps, context: EditPitState) {
    super(props, context);
    this.state = {
      keepAlive: 0,
      name: '',
      pit_id: '',
      id: '',
      delete_pit: false,
      showUpdateOptions: false,
      isLoading: false,
      checked: false,
      AddTimeHr: 0,
      AddTimeMin: 0,
      addTime: 0,
      isSavedObject: true,
      makedashboardschecked: false,
      creation_time: 0,
    };
  }

  componentDidMount() {
    this.setFormValuesForEditMode();
    console.log('These are the props in mount');
    console.log('here', this.props);
  }

  resetFormValues = () => {
    this.setFormValuesForEditMode();
    this.setState({ showUpdateOptions: false });
  };

  setFormValuesForEditMode() {
    if (this.props.existingPointInTime) {
      const {
        creation_time,
        keepAlive,
        name,
        pit_id,
        id,
        addtime,
        isSavedObject,
      } = this.props.existingPointInTime;
      this.setState({
        keepAlive,
        name,
        pit_id,
        id,
        addTime: addtime,
        isSavedObject,
        creation_time,
      });
    }
  }

  onChangeName = (e: { target: { value: any } }) => {
    this.setState({ name: e.target.value });
  };

  onChangeKeepAlive = (e: { target: { value: any } }) => {
    this.setState({ name: e.target.value });
  };

  isFormValid = (): boolean => {
    console.log('This is the form validation');
    return true;
  };

  onClickUpdatePit = async () => {
    if (this.isFormValid()) {
      console.log(this.state, 'State');
      const formValues: PointInTimeAttributes = {
        name: this.state.name,
        keepAlive: this.state.keepAlive,
        creation_time: this.state.creation_time,
        id: this.state.id,
        pit_id: this.state.pit_id,
        addtime: this.state.addTime,
        delete_on_expiry: this.state.checked,
        isSavedObject: this.state.isSavedObject,
      };
      this.setState({ isLoading: true });

      try {
        console.log('OnClickUpdate', formValues);
        await this.props.handleSubmit(formValues);
        this.setState({ showUpdateOptions: false });
        this.setFormValuesForEditMode();
      } catch (e) {
        this.props.displayToastMessage({
          id: 'PointInTimeManagement.editPointInTime.editPointInTimeFailMsg',
          defaultMessage: 'Updating the Point in time failed with some errors.',
        });
      } finally {
        this.setState({ isLoading: false });
      }
    }
  };

  onChange = (e) => {
    this.setState({ checked: e.target.checked });
  };

  didFormValuesChange = () => {
    const formValues: PointInTimeAttributes = {
      name: this.state.name,
      pit_id: this.state.pit_id,
      keepAlive: this.state.keepAlive,
      id: this.state.id,
      addtime: this.state.addTime,
      delete_on_expiry: this.state.checked,
    };

    const { keepAlive, name, pit_id, id, delete_on_expiry } = this.props.existingPointInTime;

    const isNameChanged: boolean = formValues.name !== name;
    const isAddTimeChanged: boolean = formValues.addtime > 0;
    const isDeleteOnExpirtChanged: boolean = formValues.delete_on_expiry !== delete_on_expiry;
    if (isNameChanged || isAddTimeChanged || isDeleteOnExpirtChanged) {
      this.setState({ showUpdateOptions: true });
    } else {
      this.setState({ showUpdateOptions: false });
    }
  };

  onChangeFormValues = () => {
    setTimeout(() => {
      this.didFormValuesChange();
    }, 0);
  };

  onChangeTimeHr = (e: { target: { value: any } }) => {
    this.setState({
      AddTimeHr: parseInt(e.target.value),
      addTime: 60 * parseInt(e.target.value) + this.state.AddTimeMin,
    });
    console.log(this.state);
  };

  onChangeTimeMin = (e: { target: { value: any } }) => {
    this.setState({
      AddTimeMin: parseInt(e.target.value),
      addTime: 60 * this.state.AddTimeHr + parseInt(e.target.value),
    });
    console.log(this.state);
  };

  onChangePitName = (e: { target: { value: any } }) => {
    this.setState({ name: e.target.value });
    console.log(e.target.value);
  };

  onChangeDeleteObject = (e) => {
    this.setState({ checked: e.target.checked });
    console.log(this.state.checked);
  };

  renderBottomBar = () => {
    return (
      <EuiBottomBar data-test-subj="datasource-edit-bottomBar">
        <EuiFlexGroup
          justifyContent="spaceBetween"
          alignItems="center"
          responsive={false}
          gutterSize="s"
        >
          <EuiFlexItem />
          <EuiFlexItem />
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              color="ghost"
              size="s"
              iconType="cross"
              onClick={() => this.resetFormValues()}
              aria-describedby="aria-describedby.countOfUnsavedSettings"
              data-test-subj="pit-edit-cancelButton"
            >
              Discard changes
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              className="mgtAdvancedSettingsForm__button"
              color="secondary"
              fill
              size="s"
              iconType="check"
              onClick={this.onClickUpdatePit}
              data-test-subj="pit-edit-saveButton"
            >
              Save changes
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiBottomBar>
    );
  };

  configurationForm = (isSavedObject: boolean) => {
    return isSavedObject ? (
      <EuiForm
        component="form"
        onChange={() => this.onChangeFormValues()}
        data-test-subj="pit-edit-2"
      >
        <EuiDescribedFormGroup
          title={<h3>PIT name</h3>}
          description={<p>Choose a name for a PIT that is available in OpenSearch Dashboards.</p>}
        >
          <EuiFormRow
            label="PIT name"
            helpText="Specify a unique and descriptive name that is easy to recognize."
          >
            <EuiFieldText name="pit-name" value={this.props.existingPointInTime.name} onChange={this.onChangePitName} />
          </EuiFormRow>
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup
          title={<h3>Post-expiration actions</h3>}
          description={
            <p>
              PIT data is lost once it expires you have the option to keep the PIT metadata after
              after expiration. expiration. expiration. expiration. expiration. You can also choose
              to keep the Dashboard Object expiration. This object will be converted to an Index
              Pattern and Pattern and it will reference data.
            </p>
          }
        >
          <EuiFormRow>
            <>
              <EuiCheckbox
                id="pit-id"
                label="Delete dependent saved objects at PIT expiration"
                checked={this.state.checked}
                onChange={this.onChangeDeleteObject}
              />
            </>
          </EuiFormRow>
        </EuiDescribedFormGroup>
      </EuiForm>
    ) : (
      <EuiForm
        component="form"
        onChange={() => this.onChangeFormValues()}
        data-test-subj="pit-edit-2"
      >
        <EuiDescribedFormGroup
          title={<h3>Dashboard availability</h3>}
          description={
            <p>To use this PIT in OpenSearch Dashboards, make it available to Dashboards.</p>
          }
        >
          <EuiFormRow>
            <EuiSwitch
              label="Make available in dashboards"
              checked={this.state.makedashboardschecked}
              onChange={(e) =>
                this.setState({ ...this.state, makedashboardschecked: e.target.checked })
              }
            />
          </EuiFormRow>

          {this.state.makedashboardschecked && (
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
                  <EuiFieldText placeholder="Descriptive name" value={this.state.name} onChange={this.onChangePitName} />
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGroup>
          )}
        </EuiDescribedFormGroup>
        <EuiDescribedFormGroup
          title={<h3>Post-expiration actions</h3>}
          description={
            <p>
              PIT data is lost once it expires you have the option to keep the PIT metadata after
              after expiration. expiration. expiration. expiration. expiration. You can also choose
              to keep the Dashboard Object expiration. This object will be converted to an Index
              Pattern and Pattern and it will reference data.
            </p>
          }
        >
          <EuiFormRow>
            <>
              <EuiCheckbox
                id="pit-id"
                label="Delete dependent saved objects at PIT expiration"
                checked={this.state.checked}
                onChange={this.onChangeDeleteObject}
              />
            </>
          </EuiFormRow>
        </EuiDescribedFormGroup>
      </EuiForm>
    );
  };
  render() {
    return (
      <>
        <EuiPageContent
          data-test-subj="PitConfiguration"
          role="region"
          aria-label={i18n.translate('pitManagement.editPage', {
            defaultMessage: 'Point in Time',
          })}
        >
          <EuiPageHeader bottomBorder>
            <EuiPageHeaderSection>
              <EuiTitle size="l">
                <h1>Time Configurations </h1>
              </EuiTitle>
            </EuiPageHeaderSection>
          </EuiPageHeader>
          <EuiSpacer />
          <EuiForm
            component="form"
            onChange={() => this.onChangeFormValues()}
            data-test-subj="pit-edit"
          >
            <EuiDescribedFormGroup
              title={<h3>Add time</h3>}
              description={
                <p>
                  The keep_alive time is the amount of time the PIT is kept active. The time entered
                  will also be the amount of time a PIT is extended by when it is queried. A PITs
                  time can not be extended by an amount less than the one entered. The keep alive
                  time can not exceed a maximum of X hours.
                </p>
              }
            >
              <EuiFormRow>
                <EuiFlexGroup>
                  <EuiFlexItem>
                    <EuiFieldNumber value={this.state.AddTimeHr} min={0} max={23} placeholder="Hour(s)" onChange={this.onChangeTimeHr} />
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <EuiFieldNumber value={this.state.AddTimeMin} min={0} max={59} placeholder="Min(s)" onChange={this.onChangeTimeMin} />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFormRow>
            </EuiDescribedFormGroup>
          </EuiForm>
        </EuiPageContent>
        <EuiSpacer />
        <EuiPageContent
          data-test-subj="PitConfiguration"
          role="region"
          aria-label={i18n.translate('pitManagement.editPage', {
            defaultMessage: 'Point in Time',
          })}
        >
          <EuiPageHeader bottomBorder>
            <EuiPageHeaderSection>
              <EuiTitle size="l">
                <h1>Dashboard PIT configurations</h1>
              </EuiTitle>
            </EuiPageHeaderSection>
          </EuiPageHeader>
          <EuiSpacer />
          {this.state.isSavedObject
            ? this.configurationForm(this.state.isSavedObject)
            : this.configurationForm(this.state.isSavedObject)}
        </EuiPageContent>
        {this.state.showUpdateOptions ? this.renderBottomBar() : null}
      </>
    );
  }
}
