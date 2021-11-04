import React from 'react';
import {CURRENT_VERSION} from "../../constant";
import LanguagePicker from "../components/LanguagePicker";
import LogoutButton from "../components/LogoutButton";
import ReInviteButton from "../components/ReInviteButton";
import clsx from "clsx";
import style from "./Footer.module.scss";

const Footer = ({loggedIn}) => {
  const year = new Date().getFullYear();
  return (
    <div className={`footer`}>
      <span className='font-input-label'>
        v{CURRENT_VERSION} ©{year} All rights reserved Kenzen, Inc.
      </span>

      <div className="buttons">
        {loggedIn && <LogoutButton/>}
        <div className={clsx(style.LanguageWrapper)}>
          <LanguagePicker/>
        </div>
        {
          loggedIn &&
          <div className={clsx(style.ReInviteWrapper)}>
            <ReInviteButton/>
          </div>
        }
      </div>
    </div>
  );
}

export default Footer;