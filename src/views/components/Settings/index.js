import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';
import style from './Settings.module.scss';
import Popup from 'reactjs-popup';
import defaultAvatar from '../../../assets/images/logo_round.png';
import Toggle from '../Toggle';
import { get } from 'lodash';
import { setMetricAction } from '../../../redux/action/ui';
import ConfirmModalV2 from '../ConfirmModalV2';
import { USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN, USER_TYPE_TEAM_ADMIN } from '../../../constant';
import { logout } from '../../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import { isAdmin, concatAsUrlParam, getUrlParamAsJson } from '../../../utils';
import LanguageModal from '../LanguageModal';
import closeIconV2 from '../../../assets/images/close-white.svg';
import menuIcon from '../../../assets/images/menu.svg';
import pjson from '../../../../package.json';
import { isProductionMode } from '../../../App';

const popupContentStyle = {
  boxShadow: '0px 15px 40px rgba(0, 0, 0, 0.5)',
  borderRadius: '10px 0 10px 10px',
  padding: '25px 25px 10px 25px',
  marginTop: '17px',
  background: 'white',
  width: '268px'
};

const Settings = ({
  userType,
  t,
  profile,
  metric,
  setMetric,
  isEntry,
  myOrganization,
  mode // dashboard | analytics | admin
}) => {
  const ref = React.useRef();
  const navigate = useNavigate();
  const [visiblePopup, setVisiblePopup] = React.useState(false);
  const [visibleLanguageModal, setVisibleLanguageModal] = React.useState(false);
  const [orgLabel, setOrgLabel] = React.useState('');
  const [openMode, setOpenMode] = React.useState(''); // dashboard | analytics | admin

  React.useEffect(() => {
    if (myOrganization?.name) {
      setOrgLabel(myOrganization?.name);
    }
  }, [myOrganization?.name]);

  const flattened = concatAsUrlParam(getUrlParamAsJson());

  const [leavePopup, setLeavePopup] = React.useState({
    visible: false,
    title: ''
  });
  const hasAccessToAnalytics = React.useMemo(() => {
    return userType?.some((it) => [USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN].includes(it));
  }, [userType]);
  const hasAccessToNews = React.useMemo(() => {
    if (isProductionMode) {
      return false;
    } else {
      return userType?.some((it) => [USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN].includes(it));
    }
  }, [userType]);

  const role = React.useMemo(() => {
    if (userType?.includes(USER_TYPE_ADMIN)) {
      return t('administrator super');
    } else if (userType?.includes(USER_TYPE_ORG_ADMIN)) {
      return t('organization admin');
    } else if (userType?.includes(USER_TYPE_TEAM_ADMIN)) {
      return t('team admin');
    } else {
      return t('operator');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userType]);
  const items = React.useMemo(() => {
    const ret = [
      {
        title: t('user profile'),
        handleClick: () => {
          ref.current.close();
          navigate('/profile');
        }
      },
      {
        title: t('language'),
        handleClick: () => {
          ref.current.close();
          setVisibleLanguageModal(true);
        }
      },
      {
        title: (
          <a
            href={'https://kenzen.com/support/'}
            target="_blank"
            rel="noreferrer"
            className="text-black no-underline no-outline"
          >
            {t('support')}
          </a>
        )
      },
      {
        title: (
          <a
            href={'https://kenzen.com/kenzen-solution-privacy-policy/'}
            target="_blank"
            rel="noreferrer"
            className="text-black no-underline no-outline"
          >
            {t('privacy policy')}
          </a>
        )
      }
    ];

    if (hasAccessToNews) {
      ret.push({
        title: t('news'),
        handleClick: () => {
          ref.current.close();
          navigate('/news');
        }
      });
    }

    if (!isEntry && isAdmin(userType)) {
      let newItems = [];
      if (mode === 'dashboard') {
        newItems = [
          {
            title: t('administration'),
            handleClick: () => {
              setOpenMode('admin');
              setLeavePopup({
                visible: true,
                title: t('open administration')
              });
            }
          }
        ];
      } else if (mode === 'analytics') {
        newItems = [
          {
            title: t('administration'),
            handleClick: () => {
              setOpenMode('admin');
              setLeavePopup({
                visible: true,
                title: t('open administration')
              });
            }
          },
          {
            title: t('dashboard'),
            handleClick: () => {
              setOpenMode('dashboard');
              setLeavePopup({
                visible: true,
                title: t('open dashboard')
              });
            }
          }
        ];
      } else if (mode === 'admin') {
        newItems = [
          {
            title: t('dashboard'),
            handleClick: () => {
              setOpenMode('dashboard');
              setLeavePopup({
                visible: true,
                title: t('open dashboard')
              });
            }
          }
        ];
      }

      if (hasAccessToAnalytics && ['admin', 'dashboard'].includes(mode)) {
        newItems.push({
          title: t('analytics'),
          handleClick: () => {
            setOpenMode('analytics');
            setLeavePopup({
              visible: true,
              title: t('open analytics')
            });
          }
        });
      }

      ret.splice(0, 0, ...newItems);
    }

    return ret;
  }, [mode, isEntry, t, userType, navigate, hasAccessToAnalytics, hasAccessToNews]);

  const direction = React.useMemo(() => {
    return 'bottom right';
  }, []);

  React.useEffect(() => {
    if (visiblePopup || leavePopup.visible) {
      ref.current.close();
    }
  }, [visiblePopup, leavePopup]);
  const visibleUnitToggle = React.useMemo(() => ['analytics', 'dashboard'].includes(mode), [mode]);

  const handleLeave = React.useCallback(() => {
    setLeavePopup({ visible: false, title: '' });
    if (openMode === 'admin') {
      const win = window.open('/invite', '_blank');
      win.focus();
    } else if (openMode === 'dashboard') {
      const win = window.open(`/dashboard/multi?${flattened}`, '_blank');
      win.focus();
    } else if (openMode === 'analytics') {
      const win = window.open('/analytics', '_blank');
      win.focus();
    }
  }, [openMode, flattened]);

  return (
    <>
      <Popup
        trigger={(open) => (
          <img
            src={open ? closeIconV2 : menuIcon}
            alt="setting icon"
            style={{ cursor: 'pointer', marginLeft: open ? '25px' : '15px' }}
          />
        )}
        ref={ref}
        position={direction}
        arrow={false}
        closeOnEscape
        {...{ contentStyle: popupContentStyle }}
      >
        <div className={clsx(style.Popup)}>
          <div className={clsx(style.UserInfo)}>
            <img className={clsx(style.Avatar)} src={defaultAvatar} alt="avatar" />

            <div>
              <div>
                <span className={clsx('font-binary')}>
                  {`${profile?.firstName} ${profile?.lastName}`}
                </span>
              </div>
              <div>
                <span className={clsx('font-button-label')}>{orgLabel}</span>
              </div>
              <div>
                <span className={clsx('font-binary')}>{role}</span>
              </div>
            </div>
          </div>

          <div className={clsx(style.Divider)} />

          {items.map((it, index) => (
            <div
              key={`menu-item-${index}`}
              className={clsx(style.MenuItem, 'cursor-pointer')}
              onClick={it.handleClick ? () => it.handleClick() : () => {}}
            >
              <span className={clsx('font-binary')}>{it.title}</span>
            </div>
          ))}
          {visibleUnitToggle ? (
            <div className={clsx(style.MenuItem)}>
              <span className={clsx('font-binary')}>{t('units')}</span>

              <Toggle
                on={metric}
                titleOn={t('imperial')}
                titleOff={t('metric')}
                handleSwitch={(v) => setMetric(v)}
              />
            </div>
          ) : null}
          <div
            className={clsx(style.MenuItem, 'cursor-pointer')}
            onClick={() => setVisiblePopup(true)}
          >
            <span className={clsx('font-binary')}>{t('log out')}</span>
          </div>

          <div className={clsx(style.VersionWrapper)}>
            <span className="font-helper-text">v{pjson.version}</span>
          </div>
        </div>
      </Popup>

      <ConfirmModalV2
        show={visiblePopup}
        header={t('logout kenzen')}
        onOk={() => {
          setVisiblePopup(false);
          logout();
        }}
        onCancel={() => {
          setVisiblePopup(false);
        }}
      />
      <ConfirmModalV2
        show={leavePopup.visible}
        header={leavePopup.title}
        visibleCancel={false}
        okText={t('ok')}
        onOk={handleLeave}
        onCancel={() => {
          setLeavePopup({ visible: false, title: '' });
        }}
      />
      <LanguageModal
        show={visibleLanguageModal}
        header={t('language')}
        onCancel={() => setVisibleLanguageModal(false)}
      />
    </>
  );
};

const mapStateToProps = (state) => ({
  metric: get(state, 'ui.metric'),
  userType: get(state, 'auth.userType'),
  profile: get(state, 'profile.profile'),
  myOrganization: get(state, 'profile.organization')
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setMetric: setMetricAction
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Settings));
