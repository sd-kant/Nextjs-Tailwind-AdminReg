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
import {useNavigate} from "react-router-dom";
import queryString from "query-string";
import {ableToLogin, concatAsUrlParam} from "../../../utils";
import {getCompanyById} from "../../../http";

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
    profile,
    metric,
    setMetric,
    isEntry,
    myOrgId,
    mode = "dashboard" // or admin
  }
) => {
  const ref = React.useRef();
  const navigate = useNavigate();
  const [visiblePopup, setVisiblePopup] = React.useState(false);
  const {width} = useWidthContext();
  const [orgLabel, setOrgLabel] = React.useState("");

  React.useEffect(() => {
    getCompanyById(myOrgId)
      .then(res => {
        setOrgLabel(res.data?.name);
      });
  }, [myOrgId]);

  const cachedSearchUrl = localStorage.getItem("kop-params");
  const q = queryString.parse(cachedSearchUrl);
  const flattened = concatAsUrlParam(q);

  const [leavePopup, setLeavePopup] = React.useState({
    visible: false, title: '',
  });

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
        title: mode === "dashboard" ? t("administration") : t("dashboard"),
        handleClick: () => {
          setLeavePopup({
            visible: true,
            title: mode === "dashboard" ? t("leave team dashboard 2") : t("leave administration 2")
          });
        },
      },
      {
        title: t("user profile"),
        handleClick: () => {
          ref.current.close();
          navigate("/profile");
        },
      },
      {
        title:
          <a
            href={"https://kenzen.com/support/"}
            target="_blank"
            rel="noreferrer"
            className="text-black no-underline no-outline"
          >{t('support')}</a>,
      },
      {
        title:
          <a
            href={"https://kenzen.com/kenzen-solution-privacy-policy/"}
            target="_blank"
            rel="noreferrer"
            className="text-black no-underline no-outline"
          >{t('privacy policy')}</a>,
      },
    ];
    if (isEntry || !ableToLogin(userType)) {
      ret.splice(0, 1);
    }
    return ret;
  }, [mode, isEntry, t, userType, navigate]);

  const direction = React.useMemo(() => {
    if (mode === "dashboard") {
      return width < 768 ? 'bottom center' : 'bottom right';
    } else {
      return "bottom right";
    }
  }, [width, mode]);

  React.useEffect(() => {
    if (visiblePopup || leavePopup.visible) {
      ref.current.close();
    }
  }, [visiblePopup, leavePopup]);

  const handleLeave = React.useCallback(() => {
    setLeavePopup({visible: false, title: ''});
    if (mode === "dashboard") {
      const win = window.open("/invite", "_blank");
      win.focus();
    } else {
      const win = window.open(`/dashboard/multi?${flattened}`, "_blank");
      win.focus();
    }
  }, [mode, flattened]);

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
                <span className={clsx('font-button-label')}>
                  {orgLabel}
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
                onClick={it.handleClick ? () => it.handleClick() : () => {
                }}
              >
              <span className={clsx('font-binary')}>
                {it.title}
              </span>
              </div>
            ))
          }
          {
            mode === "dashboard" ?
              <div className={clsx(style.MenuItem)}><span className={clsx('font-binary')}>{t("units")}</span>

                <Toggle
                  on={metric}
                  titleOn={t("imperial")}
                  titleOff={t('metric')}
                  handleSwitch={v => setMetric(v)}
                />
              </div> : null
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
          setVisiblePopup(false)
        }}
      />
      <ConfirmModalV2
        show={leavePopup.visible}
        header={leavePopup.title}
        visibleCancel={false}
        okText={t("ok")}
        onOk={handleLeave}
        onCancel={() => {
          setLeavePopup({visible: false, title: ''})
        }}
      />
    </>
  )
}

const mapStateToProps = (state) => ({
  metric: get(state, "ui.metric"),
  userType: get(state, 'auth.userType'),
  profile: get(state, 'profile.profile'),
  myOrgId: get(state, "auth.organizationId"),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setMetric: setMetricAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(Settings));
