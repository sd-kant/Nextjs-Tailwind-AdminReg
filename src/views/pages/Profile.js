import React from 'react';
import logo from "../../assets/images/logo_light.svg";
import {useTranslation} from "react-i18next";
import FormProfile from "../partials/FormProfile";


const Profile = () => {
  const {t} = useTranslation();

  return (
    <div className='form-main'>
      <div className='form-header'>
        <img className='form-header-logo' src={logo} alt='kenzen logo'/>
        &nbsp;&nbsp;
        {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
        <span className='form-header-text text-capitalize'>
          //&nbsp;&nbsp;{t("user profile")}
        </span>
      </div>

      <FormProfile/>
    </div>
  )
}

export default Profile;
