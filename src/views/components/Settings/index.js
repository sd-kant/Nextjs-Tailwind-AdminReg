import * as React from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {withTranslation} from "react-i18next";
import clsx from 'clsx';
import style from './Settings.module.scss';
import settingIcon from '../../../assets/images/settings.svg';
import Popup from 'reactjs-popup';
import defaultAvatar from '../../../assets/images/logo_round.png';
import Toggle from "../Toggle";
import closeIcon from '../../../assets/images/close2.svg';
import {get} from "lodash";
import {setMetricAction} from "../../../redux/action/ui";
import ConfirmModalV2 from "../ConfirmModalV2";
import {useWidthContext} from "../../../providers/WidthProvider";
import {USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN, USER_TYPE_TEAM_ADMIN, CURRENT_VERSION} from "../../../constant";
import {logout} from "../../layouts/MainLayout";
import history from "../../../history";
import {getMyProfileAction} from "../../../redux/action/profile";

const popupContentStyle = {
  boxShadow: '0px 15px 40px rgba(0, 0, 0, 0.5)',
  borderRadius: '10px 0 10px 10px',
  padding: '25px 25px 10px 25px',
  marginTop: '17px',
  background: 'white',
  width: '268px'
}

const Settings = (
  {
    userType,
    t,
    metric,
    setMetric,
    getMyProfile,
    profile,
  }
) => {
  const ref = React.useRef();
  const [visiblePopup, setVisiblePopup] = React.useState(false);
  const [visibleLeavePopup, setVisibleLeavePopup] = React.useState(false);
  const {width} = useWidthContext();
  React.useEffect(() => {
    getMyProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const role = React.useMemo(() => {
    if (userType?.includes(USER_TYPE_ADMIN)) {
      return t("administrator super");
    } else if (userType?.includes(USER_TYPE_ORG_ADMIN)) {
      return t("organization admin");
    } else if (userType?.includes(USER_TYPE_TEAM_ADMIN)) {
      return t("team admin");
    } else {
      return t("operator");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userType]);
  const items = [
    {
      title: t("user profile"),
    },
    {
      title: t("administration"),
      handleClick: () => {
        setVisibleLeavePopup(true);
      },
    },
    {
      title: t('privacy policy'),
    },
  ];
  const direction = React.useMemo(() => {
    return width < 768 ? 'bottom left' : 'bottom right';
  }, [width]);
  React.useEffect(() => {
    if (visiblePopup || visibleLeavePopup) {
      ref.current.close();
    }
  }, [visiblePopup, visibleLeavePopup]);

  return (
    <>
      <Popup
        trigger={open => (
          <img
            src={open ? closeIcon : settingIcon}
            alt="setting icon"
            style={{cursor: 'pointer', marginLeft: open ? '25px' : '15px'}}
          />
        )}
        ref={ref}
        position={direction}
        arrow={false}
        closeOnEscape
        {...{contentStyle: popupContentStyle}}
      >
        <div className={clsx(style.Popup)}>
          <div className={clsx(style.UserInfo)}>
            <img
              className={clsx(style.Avatar)}
              src={defaultAvatar}
              alt="avatar"
            />

            <div>
              <div>
                <span className={clsx('font-binary')}>
                  {`${profile?.firstName} ${profile?.lastName}`}
                </span>
              </div>
              <div>
                <span className={clsx('font-binary')}>
                  {role}
                </span>
              </div>
            </div>
          </div>

          <div className={clsx(style.Divider)}>

          </div>

          {
            items.map((it, index) => (
              <div
                key={`menu-item-${index}`}
                className={clsx(style.MenuItem, 'cursor-pointer')}
                onClick={it.handleClick ? () => it.handleClick() : () => {}}
              >
              <span className={clsx('font-binary')}>
                {it.title}
              </span>
              </div>
            ))
          }

          <div className={clsx(style.MenuItem)}>
          <span className={clsx('font-binary')}>
            {t("units")}
          </span>

            <Toggle
              on={metric}
              titleOn={t("imperial")}
              titleOff={t('metric')}
              handleSwitch={v => setMetric(v)}
            />
          </div>

          <div
            className={clsx(style.MenuItem, 'cursor-pointer')}
            onClick={() => setVisiblePopup(true)}
          >
            <span className={clsx('font-binary')}>
              {t('log out')}
            </span>
          </div>

          <div className={clsx(style.VersionWrapper)}>
            <span className='font-helper-text'>
              v{CURRENT_VERSION}
            </span>
          </div>
        </div>
      </Popup>

      <ConfirmModalV2
        show={visiblePopup}
        header={t("logout kenzen")}
        onOk={() => {
          setVisiblePopup(false);
          logout();
        }}
        onCancel={() => {
          setVisiblePopup(false);
        }}
      />

      <ConfirmModalV2
        show={visibleLeavePopup}
        header={t("leave team dashboard")}
        onOk={() => {
          setVisibleLeavePopup(false);
          history.push("/invite");
        }}
        onCancel={() => {
          setVisibleLeavePopup(false);
        }}
      />
    </>
  )
}

const mapStateToProps = (state) => ({
  metric: get(state, "ui.metric"),
  userType: get(state, 'auth.userType'),
  profile: get(state, 'profile.profile'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setMetric: setMetricAction,
      getMyProfile: getMyProfileAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(Settings));