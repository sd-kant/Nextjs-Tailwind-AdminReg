import * as React from 'react';
import { withTranslation } from 'react-i18next';

import clsx from 'clsx';
import style from './RoundIcon.module.scss';

const RoundIcon = ({ selected = false, icon, customStyle, title }) => {
  return (
    <React.Fragment>
      <div className={clsx(style.Wrapper)} style={{ ...customStyle }}>
        <div className={clsx(style.RoundIconWrapper, selected ? style.Selected : null)}>
          <img className={clsx(style.Icon)} src={icon} alt="icon" />
        </div>
        {!!title && (
          <span
            className={clsx('font-search', style.Label, selected ? 'text-white' : 'text-gray-2')}
          >
            {title}
          </span>
        )}
      </div>
    </React.Fragment>
  );
};

export default withTranslation()(RoundIcon);
