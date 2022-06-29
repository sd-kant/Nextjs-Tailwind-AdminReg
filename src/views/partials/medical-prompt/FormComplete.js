import React, {useEffect} from 'react';
import {withTranslation, Trans} from "react-i18next";
import appStore from "../../../assets/images/app_store.svg";
import googlePlay from "../../../assets/images/google_play.svg";

const FormComplete = (props) => {
  const {t, setRestBarClass} = props;

  useEffect(() => {
    setRestBarClass('progress-100 medical');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='form-group mt-57'>
      <div>
        <div className='form-header-medium'>
        <span className='font-header-medium d-block'>
          {t("medical complete header")}
        </span>
        </div>

        <div className="mt-40">
        <span className="font-binary text-white">
          {t("medical complete description")}
        </span>
        </div>

        <div className="mt-80 d-flex justify-start align-center">
          <a
            href="https://apps.apple.com/app/id1631770130"
            target="_blank"
            rel="noreferrer"
          >
            <img
              className="cursor-pointer"
              src={appStore}
              alt="app store button"
            />
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.kenzen.v2"
            target="_blank"
            rel="noreferrer"
          >
            <img
              className="cursor-pointer"
              src={googlePlay}
              alt="google play button"
            />
          </a>
        </div>
      </div>

      <div className="mt-40">
        <span>
          <Trans
            i18nKey={"medical complete support"}
            values={{supportEmail: "support@kenzen.com"}}
            components={{
              a1: <a href="https://kenzen.com/support" rel="noreferrer" className="text-orange no-underline" target="_blank"/>,
              a2: <a className="text-orange no-underline" rel="noreferrer" href="mailto: support@kenzen.com"/>
            }}
          />
        </span>
      </div>
    </div>
  )
}

export default withTranslation()(FormComplete);