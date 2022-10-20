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

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { i18n } from '@osd/i18n';
import React, { useState, useEffect } from 'react';
import {
  EuiButtonEmpty,
  EuiPopover,
  EuiPopoverTitle,
  EuiSelectable,
  EuiButtonEmptyProps,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelectableOption,
} from '@elastic/eui';
import { EuiSelectableProps } from '@elastic/eui/src/components/selectable/selectable';
import { IndexPatternRef, PointInTimeRef } from './types';
import { ChangePatternFilter } from './change_pattern_filter';

export type ChangeIndexPatternTriggerProps = EuiButtonEmptyProps & {
  label: string;
  title?: string;
};

export function ChangeIndexPattern({
  indexPatternRefs,
  pointInTimeRefs,
  indexPatternId,
  onChangePattern,
  trigger,
  selectableProps,
}: {
  trigger: ChangeIndexPatternTriggerProps;
  indexPatternRefs: IndexPatternRef[];
  pointInTimeRefs: PointInTimeRef[];
  onChangePattern: (newId: string) => void;
  indexPatternId?: string;
  selectableProps?: EuiSelectableProps;
}) {
  const [isPopoverOpen, setPopoverIsOpen] = useState(false);
  const [isIndexPatternSelected, setIndexPatternIsSelected] = useState(true);
  const [isPointInTimeSelected, setPointInTimeIsSelected] = useState(true);

  const createTrigger = function () {
    const { label, title, ...rest } = trigger;
    return (
      <EuiButtonEmpty
        className="eui-textTruncate"
        flush="left"
        color="text"
        iconSide="right"
        iconType="arrowDown"
        title={title}
        onClick={() => setPopoverIsOpen(!isPopoverOpen)}
        {...rest}
      >
        {label}
      </EuiButtonEmpty>
    );
  };

  interface OptionData {
    value?: string | number;
    references?: any;
  }
  const indexPatternOptions = (isSelected: boolean) => {
    return isSelected
      ? [
          {
            label: 'index-pattern',
            isGroupLabel: true,
          },
          ...indexPatternRefs.map(
            ({ title, id }): EuiSelectableOption<OptionData> => ({
              label: title,
              key: id,
              searchableLabel: title,
              value: id,
              checked: id === indexPatternId ? 'on' : undefined,
            })
          ),
        ]
      : [];
  };

  const pointInTimeOptions = (isSelected: boolean) => {
    return isSelected
      ? [
          {
            label: 'point-in-time',
            isGroupLabel: true,
          },
          ...pointInTimeRefs.map(
            ({ title, id, references }): EuiSelectableOption<OptionData> => ({
              label: title,
              key: title,
              searchableLabel: title,
              value: id,
              references,
              checked: id === indexPatternId ? 'on' : undefined,
            })
          ),
        ]
      : [];
  };

  const [options, setOptions] = useState<Array<EuiSelectableOption<OptionData>>>([
    ...indexPatternOptions(isIndexPatternSelected),
    ...pointInTimeOptions(isPointInTimeSelected),
  ]);

  useEffect(() => {
    setOptions([
      ...indexPatternOptions(isIndexPatternSelected),
      ...pointInTimeOptions(isPointInTimeSelected),
    ]);
  }, [isIndexPatternSelected, isPointInTimeSelected]);

  return (
    <EuiPopover
      button={createTrigger()}
      isOpen={isPopoverOpen}
      closePopover={() => setPopoverIsOpen(false)}
      className="eui-textTruncate"
      anchorClassName="eui-textTruncate"
      display="block"
      panelPaddingSize="s"
      ownFocus
    >
      <div style={{ width: 420 }}>
        <EuiPopoverTitle>
          {i18n.translate('discover.fieldChooser.indexPattern.changeIndexPatternTitle', {
            defaultMessage: 'Change index pattern',
          })}
        </EuiPopoverTitle>
        <EuiSpacer size="l" />

        <EuiSelectable
          data-test-subj="indexPattern-switcher"
          {...selectableProps}
          searchable
          singleSelection="always"
          options={options}
          onChange={(choices: Array<EuiSelectableOption<OptionData>>) => {
            const choice = (choices.find(({ checked }) => checked) as unknown) as {
              value: string;
            };
            onChangePattern(choice.value);
            setPopoverIsOpen(false);
          }}
          searchProps={{
            compressed: true,
            ...(selectableProps ? selectableProps.searchProps : undefined),
          }}
        >
          {(list, search) => (
            <>
              <EuiFlexGroup>
                <EuiFlexItem>{search}</EuiFlexItem>
                <ChangePatternFilter
                  setIndexPatternIsSelected={setIndexPatternIsSelected}
                  setPointInTimeIsSelected={setPointInTimeIsSelected}
                />
              </EuiFlexGroup>

              {list}
            </>
          )}
        </EuiSelectable>
      </div>
    </EuiPopover>
  );
}
