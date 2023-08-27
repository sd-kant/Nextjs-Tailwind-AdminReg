import * as React from 'react';
import { withTranslation } from 'react-i18next';

import clsx from 'clsx';
import style from './OperatorDetail.scss';

const OperatorDetail = ({ t }) => {
  return (
    <div className={clsx(style.Wrapper)}>
      <div className={clsx(style.Content)}>{t('Operator Dashboard Page')}</div>
    </div>
  );
};

export default withTranslation()(OperatorDetail);
