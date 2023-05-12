import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { withTranslation } from 'react-i18next';
import { bindActionCreators } from 'redux';
import { setRestBarClassAction, showErrorNotificationAction } from '../../../redux/action/ui';
import workerOrange from '../../../assets/images/worker-orange-2.svg';
import workerOrange1 from '../../../assets/images/worker-orange.svg';
import settings from '../../../assets/images/settings-orange.svg';
import ArrowIcon from '../../../assets/images/arrow.svg';
import KenzenDeviceImg from '../../../assets/images/kenzen-device.png';
import clsx from 'clsx';
import style from './FormSelectMode.module.scss';
import { concatAsUrlParam, getUrlParamAsJson, isAdmin } from '../../../utils';
import { useNavigate } from 'react-router-dom';

const FormSelectMode = (props) => {
  const { t, setRestBarClass, userType } = props;
  const flattened = concatAsUrlParam(getUrlParamAsJson());
  const navigate = useNavigate();
  const hasAdminRole = React.useMemo(() => isAdmin(userType), [userType]);

  useEffect(() => {
    setRestBarClass(`progress-50`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="form-group mt-25">
      <div>
        <div>
          <span className="font-big text-uppercase text-orange">{t('welcome to kenzen')}</span>
        </div>

        <div className="mt-25">
          <span className="font-binary">{t('select option')}</span>
        </div>

        <div className={clsx(style.Row, 'mt-40')}>
          {hasAdminRole && (
            <>
              <div className={clsx(style.OptionWrapper)} onClick={() => navigate('/invite')}>
                <div>
                  <span className={clsx('font-button-label')}>{t('administration')}</span>
                </div>

                <div className={clsx(style.ImageWrapper)}>
                  <img
                    src={workerOrange1}
                    className={clsx(style.WorkerOrangeImage)}
                    alt="worker orange"
                  />
                  <img src={settings} className={clsx(style.SettingsImage)} alt="settings" />
                </div>

                <div className={clsx(style.DescriptionDiv)}>
                  <span className={clsx('font-small')}>{t('create or modify team')}</span>
                </div>
              </div>

              <div
                className={clsx(style.OptionWrapper)}
                // todo encodeURIComponent
                onClick={() => navigate(`/dashboard/multi?${flattened}`)}>
                <div>
                  <span className={clsx('font-button-label')}>{t('dashboard')}</span>
                </div>

                <div className={clsx(style.ImageWrapper2_Body)}>
                  <div className={clsx(style.ImageWrapper2)}>
                    <img
                      src={workerOrange}
                      className={clsx(style.WorkerWhiteImage1)}
                      alt="settings"
                    />
                    {/*<img
                      src={workerOrange}
                      className={clsx(style.WorkerWhiteImage2)}
                      alt="settings"
                    />*/}
                    <img
                      src={workerOrange}
                      className={clsx(style.WorkerOrangeImage)}
                      alt="worker orange"
                    />
                  </div>
                </div>

                <div className={clsx(style.DescriptionDiv)}>
                  <span className={clsx('font-small')}>{t('monitor your team')}</span>
                </div>
              </div>

              <div
                className={clsx(style.OptionWrapper)}
                onClick={() => navigate('/connect/member/company')}>
                <div>
                  <span className={clsx('font-button-label')}>{t('phone free hub')}</span>
                </div>

                <div className={clsx(style.ImageWrapper3)}>
                  <div className={clsx(style.GroupMembers)}>
                    <img
                      src={workerOrange}
                      className={clsx(style.WorkerWhiteImage1)}
                      alt="settings"
                    />
                    <img src={workerOrange} alt="worker" />
                  </div>
                  <img src={ArrowIcon} className={clsx(style.Arrow)} alt="arrow" />
                  <img src={KenzenDeviceImg} alt="kenzen device" />
                </div>

                <div className={clsx(style.DescriptionDiv)}>
                  <span className={clsx('font-small')}>{t('connect team member')}</span>
                </div>
              </div>
            </>
          )}

          <div className={clsx(style.OptionWrapper)} onClick={() => navigate('/connect/device')}>
            <div>
              <span className={clsx('font-button-label')}>{t('phone free hub')}</span>
            </div>

            <div className={clsx(style.ImageWrapper4)}>
              <img src={workerOrange} alt="worker" />
              <img src={ArrowIcon} alt="arrow" />
              <img src={KenzenDeviceImg} alt="kenzen device" />
            </div>

            <div className={clsx(style.DescriptionDiv)}>
              <span className={clsx('font-small')}>{t('connect your device')}</span>
            </div>
          </div>

          <div className={clsx(style.OptionWrapper)} onClick={() => navigate('/profile')}>
            <div>
              <span className={clsx('font-button-label text-capitalize')}>{t('profile')}</span>
            </div>

            <div className={clsx(style.ImageWrapper)}>
              <img
                src={workerOrange1}
                className={clsx(style.WorkerOrangeImage)}
                alt="worker orange"
              />
              <img src={settings} className={clsx(style.SettingsImage)} alt="settings" />
            </div>

            <div className={clsx(style.DescriptionDiv)}>
              <span className={clsx('font-small text-capitalize')}>{t('modify profile')}</span>
            </div>
          </div>
        </div>
      </div>

      <div />
    </div>
  );
};

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType')
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setRestBarClass: setRestBarClassAction,
      showErrorNotification: showErrorNotificationAction
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(FormSelectMode));
