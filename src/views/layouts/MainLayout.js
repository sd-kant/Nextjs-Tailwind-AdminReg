import React from "react";
import logo from "../../assets/images/logo_light.svg";
import DashLogoutButton from "../components/DashLogoutButton";

export const logout = () => {
  const lang = localStorage.getItem("kop-v2-lang");
  localStorage.clear();
  localStorage.setItem("kop-v2-lang", lang);
  window.location.href = "/";
}

const MainLayout = (props) => {
  return (
    <div>
      <DashLogoutButton/>
      <div className="dashboard">
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