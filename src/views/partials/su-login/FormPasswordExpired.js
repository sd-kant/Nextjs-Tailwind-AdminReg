import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {
  Form,
  withFormik
} from "formik";
import {bindActionCreators} from "redux";
import {
  setLoadingAction,
  setRestBarClassAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from "../../../redux/action/ui";
import {
  setPasswordExpiredAction,
  setTokenAction
} from "../../../redux/action/auth";
import {
  checkPasswordValidation,
} from "../../../utils";
import {resetPasswordWithToken} from "../../../http";
import {get} from "lodash";
import PasswordInput from "../../components/PasswordInput";

export const formSchema = (t) => {
  return Yup.object().shape({
    password: Yup.string()
      .required(t('your password required'))
      .min(10, t('password min error'))
      .max(1024, t('password max error'))
      .test(
        'is-valid',
        t('password invalid'),
        function (value) {
          return checkPasswordValidation(value);
        },
      ),
    newPassword: Yup.string()
      .required(t('your password required'))
      .min(10, t('password min error'))
      .max(1024, t('password max error'))
      .test(
        'is-valid',
        t('password invalid'),
        function (value) {
          return checkPasswordValidation(value);
        },
      ),
    confirmPassword: Yup.string()
      .required(t('confirm password required'))
      .test(
        'is-equal',
        t('confirm password invalid'),
        function (value) {
          return (this.parent.newPassword === value);
        },
      ),
  });
};

const FormPasswordExpired = (props) => {
  const {
    values,
    errors,
    touched,
    t,
    setFieldValue,
    setRestBarClass
  } = props;

  useEffect(() => {
    setClassName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeFormField = (e) => {
    const {value, name} = e.target;
    setFieldValue(name, value);

    setClassName();
  };

  const setClassName = () => {
    let sum = 0;
    sum += values["password"] ? 1 : 0;
    sum += values["newPassword"] ? 1 : 0;
    sum += values["confirmPassword"] ? 1 : 0;
    setRestBarClass(`progress-${sum * 27}`);
  };

  const active = React.useMemo(() => {
    return values['password'] && values['newPassword'] && values['confirmPassword'];
  }, [values]);

  return (
    <Form className='form-group mt-57'>
      <div>
        <div className='grouped-form'>
          <label className="font-binary d-block">
            {t("password expired description")}
          </label>
        </div>

        <div className='d-flex flex-column mt-40'>
          <label className='font-input-label'>
            {t("password")}
          </label>

          <PasswordInput
            name="password"
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
          <label className='font-input-label'>
            {t("new password")}
          </label>

          <PasswordInput
            name="newPassword"
            value={values["newPassword"]}
            onChange={changeFormField}
          />

          {
            errors.newPassword && touched.newPassword && (
              <span className="font-helper-text text-error mt-10">{errors.newPassword}</span>
            )
          }
        </div>

        <div className='mt-40 d-flex flex-column'>
          <label className='font-input-label'>
            {t("confirm password")}
          </label>
          <PasswordInput
            name="confirmPassword"
            value={values["confirmPassword"]}
            onChange={changeFormField}
          />

          {
            errors.confirmPassword && touched.confirmPassword && (
              <span className="font-helper-text text-error mt-10">{errors.confirmPassword}</span>
            )
          }
        </div>
      </div>

      <div className='mt-80'>
        <div>
          <button
            className={`button ${active ? "active cursor-pointer" : "inactive cursor-default"}`}
            type={active ? "submit" : "button"}
          >
          <span className='font-button-label text-white'>
            {t("next")}
          </span>
          </button>
        </div>
      </div>
    </Form>
  )
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    password: '',
    newPassword: '',
    confirmPassword: '',
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props}) => {
    const {
      t,
      setPasswordExpired,
      setToken,
      token,
      setLoading,
      showSuccessNotification,
      showErrorNotification,
      navigate,
    } = props;
    try {
      setLoading(true);
      await resetPasswordWithToken({
        password: values.password,
        newPassword: values.newPassword,
      }, token);
      showSuccessNotification(t("msg password updated success"));
      showSuccessNotification(t("msg login again"));
      setToken(null);
      setPasswordExpired(false);
      navigate("/login");
    } catch (e) {
      showErrorNotification(e.response?.data.message);
    } finally {
      setLoading(false);
    }
  }
})(FormPasswordExpired);

const mapStateToProps = (state) => ({
  token: get(state, 'auth.token'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      setRestBarClass: setRestBarClassAction,
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction,
      setToken: setTokenAction,
      setPasswordExpired: setPasswordExpiredAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));