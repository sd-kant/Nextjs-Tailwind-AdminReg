import * as React from 'react';
import {withTranslation} from "react-i18next";
import clothIcon from '../../../assets/images/clothing-icon.svg';
import userSweatIcon from '../../../assets/images/user-sweat.svg';
import sunExposeIcon from '../../../assets/images/sun-exposure.svg';
import Select from "react-select";

import clsx from 'clsx';
import style from './RestBar.module.scss';
import Button from "../../components/Button";
import Toggle from "../../components/Toggle";
import {filters} from "../../modals/MemberDetail";
import RestBarSetting from "../../modals/RestBarSetting";
import RoundIcon from "../../components/RoundIcon";
import {customStyles} from "../../pages/DashboardV2";

const RestBar = (
  {
    t,
    boxShadow = false,
  }) => {
  const [outdoor, setOutdoor] = React.useState(false);
  const [visibleModal, setVisibleModal] = React.useState(false);

  return (
    <div className={clsx(style.Wrapper, boxShadow ? style.BoxShadow : null)}>
      <RestBarSetting
        open={visibleModal}
        closeModal={() => setVisibleModal(false)}
      />
      <div className={clsx(style.LeftWrapper)}>
        <div className={clsx(style.StressRisk)}>
          <div>
            <span
              className={clsx('text-uppercase font-heading-small')}
              style={{opacity: 0.71}}
            >
              {t('heat stress risk')}
            </span>
          </div>

          <div style={{marginLeft: '25px'}}>
            <Button
              size='sm'
              rounded={true}
              color='green'
              bgColor='green'
              title={t('low')}
            />
          </div>
        </div>

        <div className={clsx(style.Schedule)}>
          <span className={clsx('font-binary')}>
            {t('Work a regular schedule')}
          </span>
        </div>
      </div>

      <div className={clsx(style.RightWrapper)}>
        <div className={clsx(style.TopWrapper)}>
          <div className={clsx(style.SettingWrapper)}>
            <div className={clsx(style.Setting)}>
            <span
              className={clsx('font-heading-small text-capitalize')}
              style={{marginRight: '15px'}}
            >
              {t('setting')}
            </span>

              <Toggle
                on={outdoor}
                handleSwitch={(v) => {
                  setOutdoor(v);
                  setVisibleModal(true);
                }}
                titleOn={t('indoor')}
                titleOff={t('outdoor')}
              />
            </div>

            <div className={clsx(style.Update)}>
            <span className={clsx('font-button-label text-uppercase text-blue')}>
              {t('update')}
            </span>
            </div>
          </div>

          <div className={clsx(style.IconsWrapper)}>
            <div>
              <RoundIcon
                icon={clothIcon}
                customStyle={{marginRight: '15px'}}
              />

              <RoundIcon
                icon={userSweatIcon}
                customStyle={{marginRight: '15px'}}
              />
              {
                outdoor &&
                <RoundIcon
                  icon={sunExposeIcon}
                  customStyle={{marginRight: '15px'}}
                />
              }
            </div>

            <div className={clsx(style.Update)}>
            <span className={clsx('font-button-label text-uppercase text-blue')}>
              {t('update')}
            </span>
            </div>
          </div>
        </div>

        <div className={clsx(style.MiddleWrapper)} style={{display: outdoor ? 'block' : 'none'}}>
          <div style={{width: '200px'}}>
            <Select
              className='font-heading-small text-black'
              placeholder={t("select")}
              styles={customStyles()}
              options={filters}
              maxMenuHeight={190}
            />
          </div>
        </div>

        <div className={clsx(style.BottomWrapper)}>
          <span
            className={clsx('font-helper-text')}
            style={{opacity: '50%'}}
          >
            {t("updated at", {when: "MON, APRIL 27 AT 6:55 AM"})}
          </span>
        </div>
      </div>
    </div>
  )
}

export default withTranslation()(RestBar);
