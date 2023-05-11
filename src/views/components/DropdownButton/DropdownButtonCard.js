import React from 'react';
import style from './DropdownButtonCard.module.scss';
import clsx from 'clsx';

const DropDownCard = ({ option, data = [], setOpen, onClickOption }) => (
  <div className={clsx(style.CardWrapper)}>
    <ul className={clsx('text-left', style.List)}>
      {data.map((item, i) => (
        <li
          key={`dropdown-button-option-${i}`}
          className={clsx(
            style.Item,
            'font-input-label',
            option === item.value ? style.Highlight : null
          )}
          onClick={() => {
            setOpen(false);
            onClickOption(item.value);
          }}
        >
          {item.label}
        </li>
      ))}
    </ul>
  </div>
);

export default DropDownCard;
