import React from "react";
import logo from "../../assets/images/logo_light.svg";
import DashLogoutButton from "../components/DashLogoutButton";
import {logoutAPI} from "../../http";

export const logout = () => {
  logoutAPI().finally(() => {
    const lang = localStorage.getItem("kop-v2-lang");
    const params = localStorage.getItem("kop-params");
    localStorage.clear();
    localStorage.setItem("kop-v2-lang", lang);
    localStorage.setItem("kop-params", params);
    window.location.href = "/";
  });
}

const MainLayout = (props) => {
  return (
    <div className='content'>
      <DashLogoutButton/>
      <div className="dashboard content--inner">
        <div className="dashboard-header">
          <img src={logo} className="dashboard-logo" alt="logo" />
        </div>

        <div className="dashboard-body">
          {props.children}
        </div>
      </div>
    </div>
  );
}

export default MainLayout;