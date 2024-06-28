import * as React from 'react';
import { withTranslation } from 'react-i18next';

import clsx from 'clsx';
import style from './BatteryV3.module.scss';
import battery1 from '../../../assets/images/batteries/battery-1.svg';
import battery1Charge from '../../../assets/images/batteries/battery-1-charge.svg';
import battery2 from '../../../assets/images/batteries/battery-2.svg';
import battery2Charge from '../../../assets/images/batteries/battery-2-charge.svg';
import battery3 from '../../../assets/images/batteries/battery-3.svg';
import battery3Charge from '../../../assets/images/batteries/battery-3-charge.svg';
import battery4 from '../../../assets/images/batteries/battery-4.svg';
import battery4Charge from '../../../assets/images/batteries/battery-4-charge.svg';
import battery5 from '../../../assets/images/batteries/battery-5.svg';
import battery5Charge from '../../../assets/images/batteries/battery-5-charge.svg';

const BatteryV3 = ({ percent = Math.floor(Math.random() * 100), charging }) => {
  const imgSrc = React.useMemo(() => {
    if (percent > 67) {
      return charging ? battery4Charge : battery4;
    } else if (percent > 33) {
      return charging ? battery3Charge : battery3;
    } else if (percent > 20) {
      return charging ? battery1Charge : battery1;
    } else if (percent > 10) {
      return charging ? battery2Charge : battery2;
    } else {
      return charging ? battery5Charge : battery5;
    }
  }, [percent, charging]);
  return (
    <div className={clsx(style.Wrapper)}>
      <img src={imgSrc} width={36} alt="battery" />
    </div>
  );
};

export default withTranslation()(React.memo(BatteryV3));
