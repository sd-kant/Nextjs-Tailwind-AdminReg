import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {bindActionCreators} from "redux";
import {setRestBarClassAction, showErrorNotificationAction} from "../../../redux/action/ui";
import {
  ableToLogin,
  checkUsernameValidation1,
  checkUsernameValidation2, getDeviceId, getParamFromUrl, setStorageAfterLogin, setStorageAfterRegisterLogin
} from "../../../utils";
import {apiBaseUrl} from "../../../config";
import {Buffer} from "buffer";
import {
  setLoggedInAction,
  setLoginSuccessAction,
  setPasswordExpiredAction,
  setRegisterLoginSuccessAction
} from "../../../redux/action/auth";
import {useNavigate} from "react-router-dom";
import backIcon from "../../../assets/images/back.svg";
import {instance} from "../../../http";

export const formSchema = (t) => {
  return Yup.object().shape({
    username: Yup.string()
      .required(t('username required'))
      .min(6, t('username min error'))
      .max(1024, t('username max error'))
      .test(
        'is-valid-2',
        t('username invalid 2'),
        function (value) {
          return checkUsernameValidation2(value);
        }
      )
      .test(
        'is-valid-1',
        t('username invalid 1'),
        function (value) {
          return checkUsernameValidation1(value);
        }
      ),
  });
};

const FormSamlLogin = (props) => {
  const {
    values, errors, touched, t, setFieldValue, setRestBarClass,
    setLoginSuccess, setLoggedIn, setPasswordExpired,
    showErrorNotification, setRegisterLoginSuccess,
  } = props;
  const navigate = useNavigate();

  useEffect(() => {
    setClassName();
    const error = getParamFromUrl('error');
    if (error) {
      const decoded = Buffer.from(error, 'base64').toString('utf-8');
      try {
        const {
          message,
        } = JSON.parse(decoded);
        showErrorNotification(message ?? t("msg something went wrong"));
      } catch (e) {
        console.error("sso error response decode error", e);
      }
    } else {
      const data = getParamFromUrl('data');
      if (data) {
        const decoded = Buffer.from(data, 'base64').toString('utf-8');
        try {
          const {
            accessToken,
            refreshToken,
            orgId,
            userType,
            baseUri,
          } = JSON.parse(decoded);
          const source = getParamFromUrl("source");
          if (source === "create-account") { // if from onboarding
            const token = getParamFromUrl("token");
            setRegisterLoginSuccess({token: accessToken, userType, organizationId: orgId});
            setLoggedIn({loggedIn: true});
            setStorageAfterRegisterLogin({
              token: accessToken,
              baseUrl: baseUri,
            });
            navigate(`/create-account/username?token=${token}`);
          } else { // if from login
            setLoginSuccess({token: accessToken, userType, organizationId: orgId});
            setPasswordExpired(false);
            setLoggedIn({loggedIn: true});
            localStorage.setItem("kop-v2-logged-in", "true");
            setStorageAfterLogin({
              token: accessToken,
              refreshToken,
              userType,
              orgId,
              baseUrl: baseUri,
            });
            if (ableToLogin(userType)) {
              navigate("/select-mode");
            } else {
              navigate("/profile");
            }
          }
          // set api base url
          instance.defaults.baseURL = baseUri;
        } catch (e) {
          console.error("sso success response decode error", e);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeFormField = (e) => {
    const {value, name} = e.target;
    setFieldValue(name, value);

    setClassName();
  }

  const setClassName = () => {
    let sum = 0;
    sum += values["username"] ? 1 : 0;
    setRestBarClass(`progress-${sum * 100}`);
  }

  const handlePrevious = () => {
    const from = getParamFromUrl("from");
    if (from === "mobile") {
      navigate('/mobile-login');
    } else {
      navigate('/login');
    }
  }

  return (
    <Form className='form-group mt-57'>
      <div>
        <div className="d-flex align-center cursor-pointer">
          <img src={backIcon} alt="back"/>
          &nbsp;&nbsp;
          <span className='font-button-label text-orange' onClick={handlePrevious}>
              {t("previous")}
            </span>
        </div>

        <div className='d-flex flex-column mt-25'>
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
      </div>

      <div className='mt-80'>
        <div>
          <button
            className={`button ${values['username'] ? "active cursor-pointer" : "inactive cursor-default"}`}
            type={values['username'] ? "submit" : "button"}
          ><span className='font-button-label text-white text-uppercase'>{t("sign in with sso")}</span>
          </button>
        </div>
      </div>
    </Form>
  )
}

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    username: '',
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: (values, {props}) => {
    const {username} = values;
    if (username?.includes("@")) {
      props.showErrorNotification(props.t("use your username"));
      return;
    }
    // in case mobile login, get device id from param
    let deviceId = getParamFromUrl("deviceId");
    if ([null, undefined, "null", "undefined", ""].includes(deviceId)) {
      deviceId = `web:${getDeviceId()}`;
    }
    // todo attach mobile or web login param
    window.location.href = `${apiBaseUrl}/auth/saml?username=${username}&deviceId=${deviceId}`;
  }
})(FormSamlLogin);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setRestBarClass: setRestBarClassAction,
      showErrorNotification: showErrorNotificationAction,
      setLoginSuccess: setLoginSuccessAction,
      setRegisterLoginSuccess: setRegisterLoginSuccessAction,
      setLoggedIn: setLoggedInAction,
      setPasswordExpired: setPasswordExpiredAction,
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));