/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiFlexItem,
  EuiPopover,
  EuiSelectable,
  EuiSelectableOption,
} from '@elastic/eui';
import React, { useState } from 'react';

interface ChangePatternDeps {
  setIndexPatternIsSelected: (value: boolean) => void;
  setPointInTimeIsSelected: (value: boolean) => void;
}

export function ChangePatternFilter({
  setIndexPatternIsSelected,
  setPointInTimeIsSelected,
}: ChangePatternDeps) {
  const [options, setOptions] = useState<EuiSelectableOption[]>([
    { label: 'point-in-time', checked: 'on' },
    { label: 'index-pattern', checked: 'on' },
  ]);

  const [isPopoverOpen, setPopoverIsOpen] = useState(false);

  return (
    <EuiFlexItem grow={false}>
      <EuiPopover
        button={
          <EuiButton
            iconType="arrowDown"
            iconSide="right"
            onClick={() => setPopoverIsOpen(!isPopoverOpen)}
            size="s"
          >
            Filter
          </EuiButton>
        }
        isOpen={isPopoverOpen}
        closePopover={() => setPopoverIsOpen(false)}
      >
        <EuiSelectable
          searchable
          searchProps={{
            placeholder: 'Filter list',
            compressed: true,
          }}
          options={options}
          onChange={(choices) => {
            choices.find((option) => {
              if (option.label == 'point-in-time') {
                if (option.checked) {
                  setPointInTimeIsSelected(true);
                } else {
                  setPointInTimeIsSelected(false);
                }
              }

              if (option.label == 'index-pattern') {
                if (option.checked) {
                  setIndexPatternIsSelected(true);
                } else {
                  setIndexPatternIsSelected(false);
                }
              }
            });
            setOptions(choices);
          }}
        >
          {(list) => <div style={{ width: 240 }}>{list}</div>}
        </EuiSelectable>
      </EuiPopover>
    </EuiFlexItem>
  );
}
