import React from "react";
import {withTranslation} from "react-i18next";
import logoutIcon from "../../assets/images/logout.svg";
import {logout} from "../layouts/MainLayout";
import clsx from "clsx";
import style from "./LogoutButton.module.scss";

const LogoutButton = ({t}) => {
  return (
    <div className={clsx(style.Logout)}>
      <label
        className={clsx(style.LogoutLabel, 'font-input-label d-flex cursor-pointer')}
        onClick={logout}
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