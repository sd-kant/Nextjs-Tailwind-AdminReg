import * as React from 'react';

import clsx from 'clsx';
import style from './Checkbox.module.scss';

const Checkbox = ({ size = 'md', label = '', checked = false, setChecked = () => {} }) => {
  const sizeStyle = React.useMemo(() => {
    switch (size) {
      case 'md':
        return style.MD;
      case 'sm':
        return style.SM;
      default:
        return style.MD;
    }
  }, [size]);
  return (
    <label className={clsx(style.Container)} onClick={(e) => e.stopPropagation()}>
      {label ? <span>&nbsp;{label}</span> : ''}
      <input
        type="checkbox"
        checked={checked}
        className={clsx(style.Checkbox)}
        onChange={() => {}}
        onClick={(e) => {
          setChecked(e.target.checked);
          e.stopPropagation();
        }}
      />
      <span className={clsx(style.CheckMark, sizeStyle)} />
    </label>
  );
};

export default React.memo(Checkbox);
