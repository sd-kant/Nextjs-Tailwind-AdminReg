import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {checkPasswordValidation, getTokenFromUrl} from "../../../utils";
import {resetPasswordV2} from "../../../http";
import {
  setLoadingAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from "../../../redux/action/ui";
import {loginAction} from "../../../redux/action/auth";
import history from "../../../history";

const formSchema = (t) => {
  return Yup.object().shape({
    token: Yup.string(),
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
      ),
    confirmPassword: Yup.string()
      .required(t('confirm password required'))
      .test(
        'is-equal',
        t('confirm password invalid'),
        function (value) {
          return (this.parent.password === value);
        }
      ),
  });
};

const FormPassword = (props) => {
  const {
    setFieldValue,
    values,
    errors,
    touched,
    setRestBarClass,
    t,
    token,
  } = props;

  useEffect(() => {
    const tokenFromUrl = getTokenFromUrl();
    if (!tokenFromUrl) {
      if (token) {
        history.push("/create-account/name");
      } else {
        history.push("/");
      }
    } else {
      setFieldValue("token", tokenFromUrl);
    }

    setRestBarClass("progress-0");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const changeFormField = (e) => {
    const {value, name} = e.target;

    setFieldValue(name, value);
  }

  return (
    <Form className='form-group mt-57'>
      <div>
        <div className='mt-10 d-flex flex-column'>
          <label className='font-input-label'>
            {t("Username")}
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
            {t("create password")}
          </label>

          <input
            className='input input-field mt-10 font-heading-small text-white'
            name="password"
            value={values["password"]}
            type='password'
            onChange={changeFormField}
          />

          {
            errors.password && touched.password && (
              <span className="font-helper-text text-error mt-10">{errors.password}</span>
            )
          }
        </div>

        <div className='mt-40 d-flex flex-column'>
          <label className='font-input-label'>
            {t("confirm password")}
          </label>

          <input
            className='input input-field mt-10 font-heading-small text-white'
            name="confirmPassword"
            type='password'
            value={values["confirmPassword"]}
            onChange={changeFormField}
          />

          {
            errors.confirmPassword && touched.confirmPassword && (
              <span className="font-helper-text text-error mt-10">{errors.confirmPassword}</span>
            )
          }
        </div>

        <div className='mt-40'>
            <span className='font-helper-text'>
              {t("password rule")}
            </span>
        </div>
      </div>

      <div className='mt-80'>
        <button
          className={`button ${values['password'] && values['confirmPassword'] ? "active cursor-pointer" : "inactive cursor-default"}`}
          type={values['password'] && values['confirmPassword'] ? "submit" : "button"}
        >
              <span className='font-button-label text-white'>
                {t("next")}
              </span>
        </button>
      </div>
    </Form>
  )
}

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    token: '',
    username: '',
    password: '',
    confirmPassword: '',
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props}) => {
    const data = {
      token: values["token"],
      password: values["password"],
      username: values["username"],
    };
    const {
      setLoading,
      showSuccessNotification,
      login,
      t,
      showErrorNotification,
    } = props;

    try {
      setLoading(true);
      await resetPasswordV2(data);
      showSuccessNotification(t("msg password updated success"));
      login(values["username"], values["password"], true);
    } catch (e) {
      if (e?.response?.data?.status?.toString() === "404") {
        showErrorNotification(t("msg token expired"));
      } else {
        showErrorNotification(e.response?.data.message || t("msg something went wrong"));
      }
    } finally {
      setLoading(false);
    }
  }
})(FormPassword);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      login: loginAction,
      setLoading: setLoadingAction,
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction,
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));