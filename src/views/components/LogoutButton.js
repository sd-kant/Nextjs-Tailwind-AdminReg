import React from "react";
import {withTranslation} from "react-i18next";
import logoutIcon from "../../assets/images/logout.svg";
import {logout} from "../layouts/MainLayout";

const LogoutButton = ({t}) => {
  return (
    <div className="logout">
      <label
        className='logout-label font-input-label d-flex cursor-pointer'
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