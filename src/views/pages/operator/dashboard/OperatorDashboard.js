import * as React from 'react';
import { withTranslation } from 'react-i18next';
import OperatorDetail from 'views/partials/OperatorDetail';

import clsx from 'clsx';
import style from './OperatorDashboard.scss';

const OperatorDashboard = () => {
  return (
    <div className={clsx(style.Wrapper)}>
      <div className={clsx(style.Content)}>
        <OperatorDetail />
      </div>
    </div>
  );
};

export default withTranslation()(OperatorDashboard);
