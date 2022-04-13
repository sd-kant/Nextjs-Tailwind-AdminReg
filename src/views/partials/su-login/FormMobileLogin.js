import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import {Form, withFormik} from "formik";
import {bindActionCreators} from "redux";
import {setLoadingAction, setRestBarClassAction, showErrorNotificationAction} from "../../../redux/action/ui";
import {setBaseUriAction, setMobileTokenAction} from "../../../redux/action/auth";
// import MicrosoftLogin from "react-microsoft-login";
import {apiBaseUrl} from "../../../config";
import axios from "axios";
import {formSchema} from "./FormSULogin";

const FormMobileLogin = (props) => {
  const {values, errors, touched, t, setFieldValue, setRestBarClass} = props;

  useEffect(() => {
    setClassName();
    // todo get deviceId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeFormField = (e) => {
    const {value, name} = e.target;
    setFieldValue(name, value);

    setClassName();
  }

  const setClassName = () => {
    let sum = 0;
    sum += values["password"] ? 1 : 0;
    sum += values["username"] ? 1 : 0;
    setRestBarClass(`progress-${sum * 50}`);
  }

  /*const authHandler = (err, data) => {
    console.log(err, data);
  };*/

  const baseUrlArr = (window.location.href).split("/");
  const baseUrl = baseUrlArr[0] + "//" + baseUrlArr[2];

  return (
    <Form className='form-group mt-57'>
      <div>
        <div className='d-flex flex-column'>
          <label className='font-input-label'>
            {t("username")}
          </label>

          <input
            className='input input-field mt-10 font-heading-small text-white'
            name="username"
            value={values["username"]}
            type='text'
            onChange={changeFormField}
          />

          {
            errors.username && touched.username && (
              <span className="font-helper-text text-error mt-10">{errors.username}</span>
            )
          }
        </div>

        <div className='mt-40 d-flex flex-column'>
          <label className='font-input-label'>
            {t("password")}
          </label>

          <input
            className='input input-field mt-10 font-heading-small text-white'
            name="password"
            type='password'
            value={values["password"]}
            onChange={changeFormField}
          />

          {
            errors.password && touched.password && (
              <span className="font-helper-text text-error mt-10">{errors.password}</span>
            )
          }
        </div>

        <div className='mt-40 d-flex flex-column'>
          <a href={`${baseUrl}/forgot-password`} target="_blank" rel="noreferrer" className="font-input-label text-orange no-underline">
            {t("forgot password")}
          </a>
        </div>

        <div className='mt-10 d-flex flex-column'>
          <a href={`${baseUrl}/forgot-username`} target="_blank" rel="noreferrer" className="font-input-label text-orange no-underline">
            {t("forgot your username")}
          </a>
        </div>
      </div>

      <div className='mt-80'>
        <div>
          <button
            className={`button ${values['username'] && values['password'] ? "active cursor-pointer" : "inactive cursor-default"}`}
            type={values['username'] && values['password'] ? "submit" : "button"}
          >
          <span className='font-button-label text-white'>
            {t("sign in")}
          </span>
          </button>
        </div>

        {/*<div className="mt-40">
          <span className="font-binary text-gray">
            {t("or login with")}
          </span>
        </div>

        <div className={"mt-15"}>
          <MicrosoftLogin clientId={microsoftAppClientID} authCallback={authHandler} />
        </div>*/}
      </div>
    </Form>
  )
}

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    username: '',
    password: '',
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props}) => {
    const {t, showErrorNotification, setLoading, setBaseUri, setMobileToken, navigate} = props;
    if (values.username?.includes("@")) {
      showErrorNotification(t("use your username"));
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${apiBaseUrl}/master/lookup/username/${values.username}`);
      const {baseUri} = res.data;

      const loginRes = await axios.post(`${baseUri}/auth/login`, values);
      const {mfa, havePhone, accessToken, refreshToken} = loginRes.data;
      if (!mfa) {
        // deliver token to app
        const payload = {
          command: "login",
          baseUri: baseUri,
          accessToken: accessToken,
          refreshToken: refreshToken,
        };

        // eslint-disable-next-line no-prototype-builtins
        if (window.hasOwnProperty("kenzenAndroidClient")) {
          window.kenzenAndroidClient.postMessage(JSON.stringify(payload));
          // eslint-disable-next-line no-prototype-builtins
        } else if (window.hasOwnProperty("webkit")) {
          window.webkit.messageHandlers.kenzenIosClient.postMessage(payload);
        } else {
          console.log("Oh shit. What do I do with the token");
        }
      } else {
        setBaseUri(baseUri);
        setMobileToken(accessToken);

        if (havePhone) {
          navigate('/mobile-phone-verification/1');
        } else {
          navigate('/mobile-phone-register');
        }
      }
    } catch (e) {
      showErrorNotification(e.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }
})(FormMobileLogin);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setRestBarClass: setRestBarClassAction,
      showErrorNotification: showErrorNotificationAction,
      setBaseUri: setBaseUriAction,
      setMobileToken: setMobileTokenAction,
      setLoading: setLoadingAction,
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));