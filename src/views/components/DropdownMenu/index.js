import * as React from 'react';
import Popup from 'reactjs-popup';
import {withTranslation} from "react-i18next";
import clsx from 'clsx';
import style from './DropdownMenu.module.scss';

const popupContentStyle = {
  boxShadow: '0px 15px 40px rgba(0, 0, 0, 0.5)',
  borderRadius: '10px 0 10px 10px',
  padding: '16px 10px',
  marginTop: '17px',
  background: 'white',
  width: '160px',
}

const defaultItems = [
  {
    highlight: false,
    title: 'Sort (Max - Low)',
    action: () => {},
  },
  {
    highlight: false,
    title: 'Sort (Low - Max)',
    action: () => {},
  },
  {
    highlight: false,
    title: 'Remove',
    action: () => {},
  },
];

const DropdownMenu = (
  {
    icon,
    title = 'edit column',
    items = defaultItems,
  }) => {
  const ref = React.useRef(null);
  const closeTooltip = () => ref?.current?.close();
  document?.addEventListener('scroll', () => {
    closeTooltip();
  })

  return (
    <Popup
      ref={ref}
      trigger={icon}
      position="bottom right"
      arrow={false}
      keepTooltipInside={true}
      {...{ contentStyle: popupContentStyle }}
    >
      <div className={clsx(style.Popup)}>
        <div
          className={clsx(style.MenuHeaderItem)}
        >
          <span className={clsx('font-binary text-capitalize')}>
            {title}
          </span>
        </div>
        {
          items.map((it, index) => (
            <div key={`menu-item-${index}-${Date.now()}`} className={clsx(style.MenuItemWrapper)}>
              <div
                className={clsx(style.MenuItem, it.highlight ? style.HighLight : null, 'cursor-pointer')}
                onClick={() => {
                  it.action();
                  closeTooltip();
                }}
              >
                <span className={clsx('font-binary')}>
                  {it.title}
                </span>
              </div>
              {
                index < (items.length - 1) &&
                <div className={clsx(style.Divider)}/>
              }
            </div>
          ))
        }

      </div>
    </Popup>
  )
}

export default withTranslation()(DropdownMenu);
