import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {bindActionCreators} from "redux";
import {setRestBarClassAction, showErrorNotificationAction} from "../../../redux/action/ui";
import {loginAction} from "../../../redux/action/auth";
import {checkPasswordValidation} from "../../../utils";
import {Link} from "react-router-dom";
// import MicrosoftLogin from "react-microsoft-login";
// import {microsoftAppClientID} from "../../../config";

const formSchema = (t) => {
  return Yup.object().shape({
    username: Yup.string()
      .required(t('username required'))
      .min(6, t('username min error'))
      .max(1024, t('username max error')),
    password: Yup.string()
      .required(t('your password required'))
      .min(6, t('password min error'))
      .max(1024, t('password max error'))
      .test(
        'is-valid',
        t('password invalid'),
        function (value) {
          return checkPasswordValidation(value);
        }
      )
  });
};

const FormSULogin = (props) => {
  const {values, errors, touched, t, setFieldValue, setRestBarClass} = props;

  useEffect(() => {
    setClassName();
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

  // eslint-disable-next-line no-unused-vars
  const authHandler = (err, data) => {
    console.log(err, data);
  };

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
          <Link to={"/forgot-password"} className="font-input-label text-orange no-underline">
            {t("forgot password")}
          </Link>
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
  handleSubmit: (values, {props}) => {
    const {loginAction} = props;
    if (values.username?.includes("@")) {
      props.showErrorNotification(props.t("use your username"));
      return;
    }
    loginAction(values.username, values.password);
  }
})(FormSULogin);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setRestBarClass: setRestBarClassAction,
      loginAction: loginAction,
      showErrorNotification: showErrorNotificationAction,
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));