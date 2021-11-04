import React from "react";
import clsx from "clsx";
import style from "./ReInviteButton.module.scss";
import envelopIcon from "../../assets/images/envelope.svg";
import history from "../../history";
import {withTranslation} from "react-i18next";

const ReInviteButton = ({t}) => {
  return (
    <div className={clsx(style.Wrapper)} onClick={() => {history.push("/invite/re-invite");}}>
      <label className={clsx(style.Label, 'font-input-label d-flex cursor-pointer')}>
        <img src={envelopIcon} alt="envelop icon"/>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="capitalize">
          {t("re-invite")}
        </span>
      </label>
    </div>
  )
}

export default withTranslation()(ReInviteButton);