import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import history from "../../../history";
import {checkPasswordValidation, getTokenFromUrl} from "../../../utils";
import {resetPasswordV2} from "../../../http";
import {
  setLoadingAction, setRestBarClassAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from "../../../redux/action/ui";
import ConfirmModal from "../../components/ConfirmModal";

const formSchema = (t) => {
  return Yup.object().shape({
    token: Yup.string(),
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

const FormResetPassword = (props) => {
  const {
    setFieldValue,
    values,
    errors,
    touched,
    setRestBarClass,
    status,
    setStatus,
    t
  } = props;

  useEffect(() => {
    const token = getTokenFromUrl();
    if (!token) {
      window.location.href = "/";
    } else {
      setFieldValue("token", token);
    }

    setRestBarClass("progress-0");
  }, []);

  const changeFormField = (e) => {
    const {value, name} = e.target;

    setFieldValue(name, value);
  }

  return (
    <Form className='form-group mt-57'>
      <ConfirmModal
        show={status?.visibleModal}
        header={t("reset password confirm header")}
        subheader={t("reset password confirm subheader")}
        onOk={(e) => {
          e.preventDefault();
          setStatus({visibleModal: false});
          history.push("/login");
          return;
        }}
      />
      <div>
        <div className='d-flex flex-column'>
          <label className='font-input-label'>
            {t("new password")}
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
    password: '',
    confirmPassword: '',
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props, setStatus}) => {
    const data = {
      token: values["token"],
      password: values["password"],
    };

    try {
      props.setLoading(true);
      await resetPasswordV2(data);
      setStatus({visibleModal: true});
    } catch (e) {
      if (e?.response?.data?.status?.toString() === "404") {
        props.showErrorNotification(props.t("msg token expired"));
      } else {
        props.showErrorNotification(e.response?.data.message || props.t("msg something went wrong"));
      }
    } finally {
      props.setLoading(false);
    }
  }
})(FormResetPassword);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction,
      setRestBarClass: setRestBarClassAction,
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));