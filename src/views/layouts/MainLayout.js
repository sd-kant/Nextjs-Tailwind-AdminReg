import React from "react";
import logo from "../../assets/images/logo_light.svg";
import DashLogoutButton from "../components/DashLogoutButton";
import {logoutAPI} from "../../http";

export const logout = () => {
  let redirectUrl = null;
  logoutAPI()
    .then(res => {
      redirectUrl = res.data?.redirectUrl;
    })
    .finally(() => {
      const valuesToKeep = ["kop-v2-lang", "kop-params", "kop-v2-device-id"];
      const x = {};
      valuesToKeep.forEach(it => x[it] = localStorage.getItem(it));
      // const lang = localStorage.getItem("kop-v2-lang");
      // const params = localStorage.getItem("kop-params");
      localStorage.clear();
      valuesToKeep.forEach(it => localStorage.setItem(it, x[it]));
      // localStorage.setItem("kop-v2-lang", lang);
      // localStorage.setItem("kop-params", params);
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        window.location.href = "/";
      }
    });
};

const MainLayout = (props) => {
  return (
    <div className='content'>
      <DashLogoutButton/>
      <div className="dashboard content--inner">
        <div className="dashboard-header">
          <img src={logo} className="dashboard-logo" alt="logo"/>
        </div>

        <div className="dashboard-body">
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;