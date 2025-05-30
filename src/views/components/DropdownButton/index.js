import React from 'react';
import { withTranslation } from 'react-i18next';
import Button from '../Button';
import DropDownCard from './DropdownButtonCard';
import chevronDown from '../../../assets/images/chevron-down.svg';

import style from './DropdownButton.module.scss';
import clsx from 'clsx';

const DropdownButton = ({
  t,
  placeholder,
  option = null,
  options = [],
  onClick = () => {},
  onClickOption = () => {}
}) => {
  const [open, setOpen] = React.useState(false);
  const drop = React.useRef(null);

  function handleClick(e) {
    if (!e.target?.closest(`.${drop?.current?.className}`) && open) {
      setOpen(false);
    }
  }

  React.useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  });

  const title = React.useMemo(() => {
    return (
      options?.find((it) => it.value?.toString() === option?.toString())?.label ??
      placeholder ??
      t('select')
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, option]);

  return (
    <div
      className={clsx(style.DropdownWrapper)}
      // ref={drop}
    >
      <Button
        bgColor={'gray'}
        borderColor={'gray'}
        dropdown={true}
        fullWidth={true}
        icon={<img src={chevronDown} alt="down" />}
        title={title}
        onClick={onClick}
        drop={drop}
        onClickArrow={() => setOpen((open) => !open)}
      />
      {open && (
        <DropDownCard
          option={option}
          data={options}
          setOpen={setOpen}
          onClickOption={onClickOption}
        />
      )}
    </div>
  );
};

export default withTranslation()(DropdownButton);
