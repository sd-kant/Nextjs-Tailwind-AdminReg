import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import {bindActionCreators} from "redux";
import {
  setRestBarClassAction,
  showErrorNotificationAction
} from "../../../redux/action/ui";
import workerOrange from "../../../assets/images/worker-orange-2.svg";
import workerOrange1 from "../../../assets/images/worker-orange.svg";
import settings from "../../../assets/images/settings-orange.svg";
import clsx from "clsx";
import style from "./FormSelectMode.module.scss";
import queryString from "query-string";
import {concatAsUrlParam} from "../../../utils";
import {useNavigate} from "react-router-dom";
import {INVALID_VALUES3} from "../../../constant";

const FormSelectMode = (props) => {
  const {t, setRestBarClass} = props;
  const cachedSearchUrl = localStorage.getItem("kop-params");
  const q = queryString.parse(cachedSearchUrl);

  if (INVALID_VALUES3.includes(q.organization)) {
    q.organization = localStorage.getItem("kop-v2-picked-organization-id");
  }

  const flattened = concatAsUrlParam(q);
  const navigate = useNavigate();

  useEffect(() => {
    setRestBarClass(`progress-50`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='form-group mt-25'>
      <div>
        <div>
          <span className='font-big text-uppercase text-orange'>{t("welcome to kenzen")}</span>
        </div>

        <div className='mt-25'>
          <span className='font-binary'>{t("select option")}</span>
        </div>

        <div className={clsx(style.Row, 'mt-40')}>
          <div
            className={clsx(style.OptionWrapper)}
            onClick={() => navigate("/invite")}
          >
            <div>
              <span className={clsx('font-button-label')}>{t("administration")}</span>
            </div>

            <div className={clsx(style.ImageWrapper)}>
              <img src={workerOrange1} className={clsx(style.WorkerOrangeImage)} alt="worker orange"/>
              <img src={settings} className={clsx(style.SettingsImage)} alt="settings"/>
            </div>

            <div className={clsx(style.DescriptionDiv)}>
              <span className={clsx('font-small')}>{t("create or modify team")}</span>
            </div>
          </div>

          <div
            className={clsx(style.OptionWrapper)}
            onClick={() => navigate(`/dashboard/multi?${flattened}`)}
          >
            <div>
              <span className={clsx('font-button-label')}>{t("dashboard")}</span>
            </div>

            <div className={clsx(style.ImageWrapper2)}>
              <img src={workerOrange} className={clsx(style.WorkerWhiteImage1)} alt="settings"/>
              <img src={workerOrange} className={clsx(style.WorkerWhiteImage2)} alt="settings"/>
              <img src={workerOrange} className={clsx(style.WorkerOrangeImage)} alt="worker orange"/>
            </div>

            <div className={clsx(style.DescriptionDiv)}>
              <span className={clsx('font-small')}>{t("monitor your team")}</span>
            </div>
          </div>
        </div>
      </div>

      <div/>
    </div>
  )
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setRestBarClass: setRestBarClassAction,
      showErrorNotification: showErrorNotificationAction,
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps,
)(withTranslation()(FormSelectMode));