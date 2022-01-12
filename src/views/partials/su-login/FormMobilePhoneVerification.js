import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import {withTranslation, Trans} from "react-i18next";
import {bindActionCreators} from "redux";
import {setLoadingAction, setRestBarClassAction, showErrorNotificationAction} from "../../../redux/action/ui";
import {setMobileTokenAction} from "../../../redux/action/auth";
import CodeInput from "../../components/CodeInput";
import {get} from 'lodash';
import {requestSmsCode} from "../../../http";
import {getParamFromUrl} from "../../../utils";
import backIcon from "../../../assets/images/back.svg";
import history from "../../../history";
import axios from "axios";

const FormMobilePhoneVerification = (props) => {
  const {
    token,
    baseUri,
    t,
    setRestBarClass,
    showErrorNotification,
    setLoading,
    mode,
    setToken,
  } = props;
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [code, setCode] = useState('');

  useEffect(() => {
    setClassName();
    getMyPhoneNumber().then();
  }, [mode]);

  useEffect(() => {
    if (code?.length === 6) {
      submitCode().then();
    }
  }, [code]);

  const getMyPhoneNumber = async () => {
    if (mode === "0") {
      const phone = getParamFromUrl('phoneNumber');
      setPhoneNumber(phone);
    } else {
      if (token && baseUri) {
        try {
          setLoading(true);
          const res = await axios.get(`${baseUri}/user`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const {phoneNumber} = res.data;
          setPhoneNumber(phoneNumber);
          if (mode?.toString() === "1") { // request sms code
            await requestSmsCode(phoneNumber);
          }
        } catch (e) {
          showErrorNotification(e.response?.data?.message);
        } finally {
          setLoading(false);
        }
      }
    }
  }

  const submitCode = async () => {
    try {
      setLoading(true);
      const loginRes = await axios.post(`${baseUri}/auth/login`, {
        phoneNumber,
        loginCode: code,
      });
      const {mfa, accessToken, refreshToken} = loginRes.data;
      if (!mfa) {
        // deliver token to app
        const payload = {
          command: "login",
          baseUri: baseUri,
          accessToken: accessToken,
          refreshToken: refreshToken,
        };
        console.log("mobile login success!");
        if (window.hasOwnProperty("kenzenAndroidClient")) {
          window.kenzenAndroidClient.postMessage(JSON.stringify(payload));
        } else if (window.hasOwnProperty("webkit")) {
          window.webkit.messageHandlers.kenzenIosClient.postMessage(payload);
        } else {
          console.log("Oh shit. What do I do with the token");
        }
      } else {
        // something went wrong
      }
    } catch (e) {
      showErrorNotification(e.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }

  const setClassName = () => {
    setRestBarClass(`progress-50`);
  }

  const navigateTo = (path) => {
    history.push(path);
  }

  const resendCode = async () => {
    if (phoneNumber) {
      try {
        setLoading(true);
        await requestSmsCode(phoneNumber)
      } catch (e) {
        showErrorNotification(e.response?.data?.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className='form-group mt-57'>
      <div>
        <div
          className="d-inline-flex align-center cursor-pointer"
          onClick={() => {
            setToken(null);
            navigateTo('/mobile-login');
          }}
        >
          <img src={backIcon} alt="back"/>
          &nbsp;&nbsp;
          <span className='font-button-label text-orange text-uppercase'>
            {t("back to login")}
          </span>
        </div>

        <div className='d-flex mt-15 flex-column'>
          <label className='font-heading-small text-capitalize'>
            {t("2fa auth code")}
          </label>
        </div>

        <div className="mt-15">
          <span className={"font-binary"}>
            {t("2fa auth code description")}
          </span>
        </div>

        <div className='mt-15'>
          <span className={"font-binary"}>
            {t("auth code description")}
          </span>
          &nbsp;
          <span className={"font-binary text-orange"}>
            <Trans
              i18nKey={"auth code number"}
              values={{
                number: phoneNumber?.slice(-4),
              }}
            />
          </span>
        </div>

        <div className='mt-40 d-flex flex-column'>
          {/*todo don't accept alphabets*/}
          <CodeInput
            value={code}
            onChange={(v) => {
              setCode(v);
            }}
          />
        </div>

        <div className='mt-40'>
          <div>
            <span className={"font-binary"}>
              {t("auth code not receive")}
            </span>
            &nbsp;
            <span
              className={"font-binary text-orange cursor-pointer"}
              onClick={resendCode}
            >
              {t("auth code resend")}
            </span>
          </div>

          <div>
            <span className={"font-binary"}>
              {t("2fa auth code contact administrator")}
            </span>
          </div>
        </div>
      </div>

      <div className='mt-80'>

      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  token: get(state, 'auth.mobileToken'),
  baseUri: get(state, 'auth.baseUri'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setRestBarClass: setRestBarClassAction,
      setLoading: setLoadingAction,
      showErrorNotification: showErrorNotificationAction,
      setToken: setMobileTokenAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(FormMobilePhoneVerification));