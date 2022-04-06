import * as React from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {withTranslation} from "react-i18next";
import clsx from 'clsx';
import style from './SettingsAdmin.module.scss';
import settingIcon from '../../../assets/images/settings.svg';
import Popup from 'reactjs-popup';
import defaultAvatar from '../../../assets/images/logo_round.png';
import closeIcon from '../../../assets/images/close2.svg';
import {get} from "lodash";
import ConfirmModalV2 from "../ConfirmModalV2";
import {USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN, USER_TYPE_TEAM_ADMIN, CURRENT_VERSION} from "../../../constant";
import {logout} from "../../layouts/MainLayout";
import queryString from "query-string";
import {concatAsUrlParam} from "../../../utils";
import history from "../../../history";

const popupContentStyle = {
  boxShadow: '0px 15px 40px rgba(0, 0, 0, 0.5)',
  borderRadius: '10px 0 10px 10px',
  padding: '25px 25px 10px 25px',
  marginTop: '17px',
  background: 'white',
  width: '268px'
}

const SettingsAdmin = (
  {
    userType,
    t,
    profile,
    isEntry,
  }
) => {
  const ref = React.useRef();
  const [visiblePopup, setVisiblePopup] = React.useState(false);
  const [visibleLeavePopup, setVisibleLeavePopup] = React.useState(false);
  const cachedSearchUrl = localStorage.getItem("kop-params");
  const q = queryString.parse(cachedSearchUrl);
  const flattened = concatAsUrlParam(q);
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
  const items = React.useMemo(() => {
    const ret = [
      {
        title: t("dashboard"),
        handleClick: () => {
          setVisibleLeavePopup(true);
        },
      },
      {
        title: t("user profile"),
        handleClick: () => {
          ref.current.close();
          history.push("/profile");
        },
      },
      {
        title: <a
          href={"https://kenzen.com/kenzen-solution-privacy-policy/"}
          target="_blank"
          rel="noreferrer"
          className="text-black no-underline no-outline"
        >{t('privacy policy')}</a>,
      },
    ];
    if (isEntry) {
      ret.splice(0, 1);
    }
    return ret;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEntry]);
  const direction = 'bottom right';
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
        header={t("leave administration 2")}
        visibleCancel={false}
        okText={t("ok")}
        onOk={() => {
          setVisibleLeavePopup(false);
          const win = window.open(`/dashboard/multi?${flattened}`, "_blank");
          win.focus();
        }}
        onCancel={() => {
          setVisibleLeavePopup(false);
        }}
      />
    </>
  )
}

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType'),
  profile: get(state, 'profile.profile'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(SettingsAdmin));
