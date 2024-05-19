import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { withTranslation } from 'react-i18next';
import { bindActionCreators } from 'redux';
import { setRestBarClassAction, showErrorNotificationAction } from '../../../redux/action/ui';
import clsx from 'clsx';
import style from './FormSelectMode.module.scss';
import { concatAsUrlParam, getUrlParamAsJson, isAdmin, isOperator } from '../../../utils';
import { useNavigate } from 'react-router-dom';
import { checkIfHasAnalyticRole } from 'utils/members';
import NavBigBtn from 'views/components/NavBigBtn';

const FormSelectMode = (props) => {
  const { t, setRestBarClass, userType } = props;
  const flattened = concatAsUrlParam(getUrlParamAsJson());
  const navigate = useNavigate();
  const hasAdminRole = React.useMemo(() => isAdmin(userType), [userType]);
  const hasOperatorRole = React.useMemo(() => isOperator(userType), [userType]);
  const hasAnalyticRole = React.useMemo(() => checkIfHasAnalyticRole(userType), [userType]);

  useEffect(() => {
    setRestBarClass(`progress-50`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noreferrer');
  };

  return (
    <div className="tw-mt-6">
      <div>
        <div>
          <span className="font-big text-uppercase text-orange">{t('welcome to kenzen')}</span>
        </div>

        <div className="tw-mt-6">
          <span className="font-binary">{t('select option')}</span>
        </div>

        <div className={clsx(style.Row, 'mt-40')}>
          {hasAdminRole && (
            <NavBigBtn 
              text={t('create or modify team')} 
              topLabel={t('administration')} 
              iconName="admin"
              onClick={() => navigate('/invite')}
            />
          )}

          {hasAdminRole && (
            <NavBigBtn 
              text={t('monitor your team')} 
              topLabel={t('dashboard')} 
              iconName="dashboard"
              onClick={() => openInNewTab(`/dashboard/multi?${flattened}`)}
            />
          )}

          {hasAnalyticRole && (
            <NavBigBtn 
              text={t('analytics')} 
              topLabel={t('analytics')} 
              iconName="analytics"
              onClick={() => openInNewTab(`/analytics`)}
            />
          )}

          {hasOperatorRole && (
            <NavBigBtn 
              text={t('monitor your data')} 
              topLabel={t('my dashboard')} 
              iconName="dashboard"
              onClick={() => openInNewTab(`/dashboard/me`)}
            />
          )}

          {hasAdminRole && (
            <NavBigBtn 
              text={t('connect team member')} 
              topLabel={t('phone free hub')} 
              iconName="connect_device1"
              onClick={() => navigate('/connect/member/company')}
            />
          )}
          <NavBigBtn 
            text={t('connect your device')} 
            topLabel={t('phone free hub')} 
            iconName="connect_device2"
            onClick={() => navigate('/connect/device')}
          />
        </div>
      </div>
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
