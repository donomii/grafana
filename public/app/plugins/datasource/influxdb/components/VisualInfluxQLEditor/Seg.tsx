import React, { useState, useRef, useEffect } from 'react';
import { css } from '@emotion/css';
import { SelectableValue } from '@grafana/data';
import { useClickAway, useAsyncFn } from 'react-use';
import { InlineLabel, Select } from '@grafana/ui';

// this file is a simpler version of `grafana-ui / SegmentAsync.tsx`
// with some changes:
// 1. click-outside does not select the value. i think it's better to be explicit here.
// 2. we set a min-width on the select-element to handle cases where the `value`
//    is very short, like "x", and then you click on it and the select opens,
//    and it tries to be as short as "x" and it does not work well.

// NOTE: maybe these changes could be migrated into the SegmentAsync later

type SelVal = SelectableValue<string>;

// when allowCustomValue is true, there is no way to enforce the selectableValue
// enum-type, so i just go with `string`

type SharedProps = {
  onChange: (v: SelVal) => void;
  loadOptions: () => Promise<SelVal[]>;
  allowCustomValue?: boolean;
};

type Props = SharedProps & {
  value: string;
};

const selectClass = css({
  minWidth: '160px',
});

type SelProps = SharedProps & {
  onClose: () => void;
};

export const Sel = ({ loadOptions, allowCustomValue, onChange, onClose }: SelProps): JSX.Element => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [loadState, doLoad] = useAsyncFn(loadOptions, [loadOptions]);
  useClickAway(ref, onClose);

  useEffect(() => {
    doLoad();
  }, [doLoad, loadOptions]);
  return (
    <div ref={ref} className={selectClass}>
      <Select autoFocus isOpen allowCustomValue options={loadState.value ?? []} onChange={onChange} />
    </div>
  );
};

const buttonClass = css({
  width: 'auto',
  cursor: 'pointer',
});

export const Seg = ({ value, loadOptions, allowCustomValue, onChange }: Props): JSX.Element => {
  const [isOpen, setOpen] = useState(false);
  if (!isOpen) {
    // this should not be a label, this should be a button,
    // but this is what is used inside a Segment, and i just
    // want the same look
    return (
      <InlineLabel
        className={buttonClass}
        onClick={() => {
          setOpen(true);
        }}
      >
        {value}
      </InlineLabel>
    );
  } else {
    return (
      <Sel
        loadOptions={loadOptions}
        allowCustomValue={allowCustomValue}
        onChange={(v) => {
          setOpen(false);
          onChange(v);
        }}
        onClose={() => {
          setOpen(false);
        }}
      />
    );
  }
};
