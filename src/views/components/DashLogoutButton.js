import React from "react";
import {withTranslation} from "react-i18next";
import logoutIcon from "../../assets/images/logout.svg";
import {logout} from "../layouts/MainLayout";

const DashLogoutButton = ({t}) => {
  return (
    <div className="dash-logout">
      <label
        className='dash-logout-label font-input-label d-flex cursor-pointer'
        onClick={logout}
        style={{width: "103px"}}
      >
        <img src={logoutIcon} alt="upload icon"/>
        &nbsp;&nbsp;&nbsp;
        <span className="capitalize">
          {t("logout")}
        </span>
      </label>
    </div>
  )
};

export default withTranslation()(DashLogoutButton);