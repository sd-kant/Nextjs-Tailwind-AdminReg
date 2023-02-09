import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {
  checkUsernameValidation2,
  checkUsernameValidation1,
  getTokenFromUrl
} from "../../../utils";
import {resetPasswordV2} from "../../../http";
import {
  setLoadingAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from "../../../redux/action/ui";
import {loginAction} from "../../../redux/action/auth";
import {useNavigate} from "react-router-dom";

const formSchema = (t) => {
  return Yup.object().shape({
    token: Yup.string(),
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

const FormUsername = (props) => {
  const {
    setFieldValue,
    values,
    errors,
    touched,
    setRestBarClass,
    t,
  } = props;
  const navigate = useNavigate();
  useEffect(() => {
    const tokenFromUrl = getTokenFromUrl();
    if (!tokenFromUrl) {
      navigate("/");
    } else {
      setFieldValue("token", tokenFromUrl);
    }

    setRestBarClass("progress-0");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const changeFormField = (e) => {
    const {value, name} = e.target;

    setFieldValue(name, value);
  };

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
            placeholder={t("enter username")}
            onChange={changeFormField}
          />
          <span className="font-helper-text mt-10 text-white">{t("username length")}</span>
          {
            errors.username && touched.username && (
              <span className="font-helper-text text-error mt-10">{errors.username}</span>
            )
          }
        </div>

        <div className='mt-60'>
          <span className="font-helper-text mt-10 text-white">{t("sso note")}</span>
        </div>
      </div>

      <div className='mt-80'>
        <button
          className="button active cursor-pointer"
          type="submit"
        >
          <span className='font-button-label text-white'>
            {t("next")}
          </span>
        </button>
      </div>
    </Form>
  )
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    token: '',
    username: '',
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props}) => {
    const data = {
      token: values["token"],
      username: values["username"],
    };
    const {
      setLoading,
      showSuccessNotification,
      t,
      showErrorNotification,
      navigate,
    } = props;

    try {
      setLoading(true);
      await resetPasswordV2(data);
      showSuccessNotification(t("msg account registered"));
      navigate("/create-account/name");
    } catch (e) {
      if (e?.response?.data?.status?.toString() === "404") {
        showErrorNotification(t("msg token expired"));
      } else {
        showErrorNotification(e.response?.data.message);
      }
    } finally {
      setLoading(false);
    }
  }
})(FormUsername);

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