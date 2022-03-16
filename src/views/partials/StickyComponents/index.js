import * as React from 'react';
import {withTranslation} from "react-i18next";

import clsx from 'clsx';
import style from './StickyComponents.module.scss';
import Statistics from "../Statistics";
import {useStickyComponentsContext} from "../../../providers/StickyComponentsProvider";
import RestBar from "../RestBar";

const StickyComponents = () => {
  const {visible} = useStickyComponentsContext();
  return (
    <>
      {
        visible.statistics &&
        <div className={clsx(style.Wrapper, style.StatisticsWrapper)}>
          <Statistics
            boxShadow={true}
          />
        </div>
      }

      {
        visible.workRestBar &&
        <div className={clsx(style.Wrapper, style.WorkRestBarWrapper)}>
          <RestBar
            boxShadow={true}
          />
        </div>
      }
    </>
  )
}

export default withTranslation()(StickyComponents);
