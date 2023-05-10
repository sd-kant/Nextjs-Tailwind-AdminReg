import * as React from "react";
import {useTranslation, Trans} from "react-i18next";
import {getParamFromUrl} from "../../../utils";
import {useNavigate} from "react-router-dom";

const FormConnectDeviceSuccess = () => {
  const {t} = useTranslation();
  const deviceId = getParamFromUrl('deviceId');
  const navigate = useNavigate();

  return (
    <div className='form-group mt-57'>
      <div>
        <div className='form-header-medium'>
          <span className='font-header-medium d-block'>
            {t("connected")}
          </span>
        </div>

        <div className="mt-40">
          <span className="font-binary text-white">
            {t("device connected description")}
          </span>
        </div>

        <div className="mt-10">
          <span className="font-binary text-white">
            {deviceId}
          </span>
        </div>

        <div className="mt-25">
          <Trans
            i18nKey={"device connected support"}
            values={{supportEmail: "support@kenzen.com"}}
            components={{
              a1: <a href="https://kenzen.com/support" rel="noreferrer" className="text-orange no-underline" target="_blank"/>,
              a2: <a className="text-orange no-underline" rel="noreferrer" href="mailto: support@kenzen.com"/>
            }}
          />
        </div>


      </div>

      <div className="mt-40">
        <button
          className="button active cursor-pointer text-uppercase"
          type="button"
          onClick={() => navigate("/select-mode")}
        >
          <span className='font-button-label text-white'>
            {t("close window")}
          </span>
        </button>
      </div>
    </div>
  )
};

export default FormConnectDeviceSuccess;
