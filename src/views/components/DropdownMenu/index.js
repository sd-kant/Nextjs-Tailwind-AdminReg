import * as React from 'react';
import Popup from 'reactjs-popup';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';
import style from './DropdownMenu.module.scss';

const popupContentStyle = {
  marginTop: '17px',
  borderRadius: '10px 0 10px 10px',
  padding: '16px 10px',
  width: '160px',
  boxShadow: '0px 15px 40px rgba(0, 0, 0, 0.5)',
  background: 'white'
};

const defaultItems = [
  {
    highlight: false,
    title: 'Sort (Max - Low)',
    action: () => {}
  },
  {
    highlight: false,
    title: 'Sort (Low - Max)',
    action: () => {}
  },
  {
    highlight: false,
    title: 'Remove',
    action: () => {}
  }
];

const DropdownMenu = ({ icon, title = 'edit column', items = defaultItems }) => {
  const ref = React.useRef(null);
  const closeTooltip = () => ref?.current?.close();
  document?.addEventListener('scroll', () => {
    closeTooltip();
  });
  const handleClick = React.useCallback((it) => {
    it.action();
    closeTooltip();
  }, []);

  return (
    <Popup
      ref={ref}
      trigger={icon}
      position="bottom right"
      arrow={false}
      keepTooltipInside={true}
      {...{ contentStyle: popupContentStyle }}>
      <div className={clsx(style.Popup)}>
        <div className={clsx(style.MenuHeaderItem)}>
          <span className={clsx('font-binary text-capitalize')}>{title}</span>
        </div>
        {items.map((it, index) => (
          <div key={`menu-item-${index}-${Date.now()}`} className={clsx(style.MenuItemWrapper)}>
            <div
              className={clsx(
                style.MenuItem,
                it.highlight ? style.HighLight : null,
                'cursor-pointer'
              )}
              onClick={() => handleClick(it)}>
              <span className={clsx('font-binary')}>{it.title}</span>
            </div>
            {index < items.length - 1 && <div className={clsx(style.Divider)} />}
          </div>
        ))}
      </div>
    </Popup>
  );
};

export default withTranslation()(React.memo(DropdownMenu));
