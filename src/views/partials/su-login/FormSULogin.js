import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {bindActionCreators} from "redux";
import {setRestBarClassAction} from "../../../redux/action/ui";
import {loginAction} from "../../../redux/action/auth";
import {checkPasswordValidation} from "../../../utils";
import {Link} from "react-router-dom";
import MicrosoftLogin from "react-microsoft-login";
import {microsoftAppClientID} from "../../../config";

const formSchema = (t) => {
  return Yup.object().shape({
    email: Yup.string()
      .required(t('your email required'))
      // .email(t("email invalid"))
      .max(1024, t('email max error')),
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
  }, []);

  const changeFormField = (e) => {
    const {value, name} = e.target;
    setFieldValue(name, value);

    setClassName();
  }

  const setClassName = () => {
    let sum = 0;
    sum += values["password"] ? 1 : 0;
    sum += values["email"] ? 1 : 0;
    setRestBarClass(`progress-${sum * 50}`);
  }

  const authHandler = (err, data) => {
    console.log(err, data);
  };

  return (
    <Form className='form-group mt-57'>
      <div>
        <div className='d-flex flex-column'>
          <label className='font-input-label'>
            {t("email")}
          </label>

          <input
            className='input input-field mt-10 font-heading-small text-white'
            name="email"
            value={values["email"]}
            type='text'
            onChange={changeFormField}
          />

          {
            errors.email && touched.email && (
              <span className="font-helper-text text-error mt-10">{errors.email}</span>
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
            className={`button ${values['email'] && values['password'] ? "active cursor-pointer" : "inactive cursor-default"}`}
            type={values['email'] && values['password'] ? "submit" : "button"}
          >
          <span className='font-button-label text-white'>
            {t("sign in")}
          </span>
          </button>
        </div>

        <div className="mt-40">
          <span className="font-binary text-gray">
            {t("or login with")}
          </span>
        </div>

        <div className={"mt-15"}>
          <MicrosoftLogin clientId={microsoftAppClientID} authCallback={authHandler} />
        </div>
      </div>
    </Form>
  )
}

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    email: '',
    password: '',
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: (values, {props}) => {
    // history.push("/invite/company");
    const {loginAction} = props;
    loginAction(values.email, values.password);
  }
})(FormSULogin);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setRestBarClass: setRestBarClassAction,
      loginAction: loginAction,
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));