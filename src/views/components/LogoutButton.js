import React, {useState} from "react";
import {withTranslation} from "react-i18next";
import logoutIcon from "../../assets/images/logout.svg";
import {logout} from "../layouts/MainLayout";
import clsx from "clsx";
import style from "./LogoutButton.module.scss";
import ConfirmModalV2 from "./ConfirmModalV2";

const LogoutButton = ({t}) => {
  const [visiblePopup, setVisiblePopup] = useState(false);

  return (
    <div className={clsx(style.Logout)}>
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
      <label
        className={clsx(style.LogoutLabel, 'font-input-label d-flex cursor-pointer')}
        onClick={() => setVisiblePopup(true)}
      >
        <img src={logoutIcon} alt="upload icon"/>
        &nbsp;&nbsp;&nbsp;
        <span className="capitalize">
            {t("logout")}
        </span>
      </label>
    </div>
  )
}

export default withTranslation()(LogoutButton);