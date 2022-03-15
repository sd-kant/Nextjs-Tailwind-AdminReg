import * as React from 'react';
import {withTranslation} from "react-i18next";

import clsx from 'clsx';
import style from './RestBarSetting.module.scss';
import Modal from "react-modal";
import Toggle from "../../components/Toggle";
import Input from "../../components/Input";
import thermometerIcon from '../../../assets/images/thermometer.svg';
import humidityIcon from '../../../assets/images/humidity.svg';
import Button from "../../components/Button";
import RoundIcon from "../../components/RoundIcon";
import clothIcon from '../../../assets/images/clothing-icon.svg';
import userSweatIcon from '../../../assets/images/user-sweat.svg';
import sunExposeIcon from '../../../assets/images/sun-exposure.svg';

const RestBarSetting = (
  {
    t,
    open = false,
    closeModal = () => {
    },
  }) => {
  const [temperature, setTemperature] = React.useState(88);
  const [humidity, setHumidity] = React.useState(55);
  return (
    <Modal
      isOpen={open}
      className={clsx(style.Modal)}
      overlayClassName={clsx(style.ModalOverlay)}
      onRequestClose={closeModal}
      appElement={document.getElementsByTagName("body")}
    >
      <div className={clsx(style.Wrapper)}>
        <div>
          <span className={clsx('font-header-medium')}>Work Rest Bar Settings</span>
        </div>

        <div className={clsx(style.Body)}>
          <div className={clsx(style.Left)}>
            <div>
              <span className={clsx('font-binary text-gray-2')}>
                UPDATED MON, APRIL 27 AT 6:55 AM
              </span>
            </div>

            <div style={{marginTop: '10px'}}>
              <span className={clsx('font-heading-small')}>
                15 min work, 45 min rest
              </span>
            </div>

            <div style={{marginTop: '10px'}}>
              <div>
                <span className={clsx('font-binary')}>
                  It feels like 109°F | HEAT STRESS RISK
                </span>
              </div>
              <div>
                <Button
                  size={'xs'}
                  color={'green'}
                  bgColor={'green'}
                  title={'low'}
                  rounded={true}
                  onClick={() => {
                  }}
                >
                  Low
                </Button>
              </div>
            </div>

            <div className={clsx(style.ToggleWrapper)}>
              <span className={clsx('font-heading-small', style.ToggleLabel)}>Environment</span>
              <Toggle
                on={true}
                titleOn='indoor'
                titleOff='outdoor'
              />
            </div>

            <div style={{marginTop: '25px'}}>
              <Input
                prefix={<img src={thermometerIcon} alt="thermometer"/>}
                value={temperature}
                handleChange={setTemperature}
              />
              <span className={clsx('font-heading-small')}>
                &nbsp;&nbsp;°F
              </span>
            </div>

            <div style={{marginTop: '25px'}}>
              <Input
                prefix={<img src={humidityIcon} alt="thermometer"/>}
                value={humidity}
                handleChange={setHumidity}
              />
              <span className={clsx('font-heading-small')}>
                &nbsp;&nbsp;% rel. humidity
              </span>
            </div>
          </div>

          <div className={clsx(style.Right)}>
            <div className={clsx(style.Row)}>
              <div className={clsx(style.RowHeader)}>
                <span className={clsx('font-heading-small')}>
                  Clothing
                </span>
              </div>

              <div className={clsx(style.RowContent)}>
                <RoundIcon icon={clothIcon} title={'Light 1 Layer'} selected={true}/>
                <RoundIcon icon={userSweatIcon} title={'Medium 2 Layers'}/>
                <RoundIcon icon={sunExposeIcon} title={'Heavy Full PPE'}/>
              </div>
            </div>

            <div className={clsx(style.Row)}>
              <div className={clsx(style.RowHeader)}>
                <span className={clsx('font-heading-small')}>
                  Clothing
                </span>
              </div>

              <div className={clsx(style.RowContent)}>
                <RoundIcon icon={clothIcon} title={'Light 1 Layer'} selected={true}/>
                <RoundIcon icon={userSweatIcon} title={'Medium 2 Layers'}/>
                <RoundIcon icon={sunExposeIcon} title={'Heavy Full PPE'}/>
              </div>
            </div>

            <div className={clsx(style.Row)}>
              <div className={clsx(style.RowHeader)}>
                <span className={clsx('font-heading-small')}>
                  Clothing
                </span>
              </div>

              <div className={clsx(style.RowContent)}>
                <RoundIcon icon={clothIcon} title={'Light 1 Layer'} selected={true}/>
                <RoundIcon icon={userSweatIcon} title={'Medium 2 Layers'}/>
                <RoundIcon icon={sunExposeIcon} title={'Heavy Full PPE'}/>
              </div>
            </div>

            <div className={clsx(style.Footer)}>
              <Button
                size='sm'
                title={t('modify')}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default withTranslation()(RestBarSetting);
