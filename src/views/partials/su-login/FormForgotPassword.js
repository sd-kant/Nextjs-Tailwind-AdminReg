import React from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {bindActionCreators} from "redux";
import {setLoadingAction, setRestBarClassAction, showErrorNotificationAction} from "../../../redux/action/ui";
import ConfirmModal from "../../components/ConfirmModal";
import {instance, lookupByUsername, requestResetPassword} from "../../../http";
import backIcon from "../../../assets/images/back.svg";
import history from "../../../history";
import {checkUsernameValidation2, checkUsernameValidation1} from "../../../utils";

const formSchema = (t) => {
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

const FormForgotPassword = (props) => {
  const {values, errors, touched, t, setFieldValue, status, setStatus} = props;

  const changeFormField = (e) => {
    const {value, name} = e.target;
    setFieldValue(name, value);
  }

  return (
    <Form className='form-group mt-57'>
      <div>
        <div className="d-flex align-center cursor-pointer">
          <img src={backIcon} alt="back"/>
          &nbsp;&nbsp;
          <span className='font-button-label text-orange' onClick={() => {
            history.push('/login');
          }}>
              {t("previous")}
            </span>
        </div>

        <div className='grouped-form mt-25'>
          <label className="font-binary d-block mt-8">
            {t("forgot password description")}
          </label>
        </div>

        <div className='d-flex mt-40 flex-column'>
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
        <button
          className={`button ${values['username'] ? "active cursor-pointer" : "inactive cursor-default"}`}
          type={values['username'] ? "submit" : "button"}
        >
          <span className='font-button-label text-white'>
            {t("send")}
          </span>
        </button>
      </div>
      {
        status?.visibleModal &&
        <ConfirmModal
          show={status?.visibleModal}
          header={t("forgot password confirm header")}
          subheader={t("forgot password confirm subheader")}
          onOk={(e) => {
            e.preventDefault();
            setStatus({visibleModal: false});
            history.push("/login");
          }}
        />
      }
    </Form>
  )
}

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    username: '',
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props, setStatus}) => {
    try {
      props.setLoading(true);
      const lookupRes = await lookupByUsername(values?.username);
      const {baseUri} = lookupRes.data;
      if (baseUri) {
        instance.defaults.baseURL = lookupRes.data?.baseUri;
      }
      await requestResetPassword(values?.username);
      setStatus({visibleModal: true});
    } catch (e) {
      if (e.response?.data?.status?.toString() === "404") { // if user not found
        props.showErrorNotification(props.t("forgot password name not registered"));
      } else {
        props.showErrorNotification(
          e?.response.data?.message || props.t("msg something went wrong"),
        );
      }
    } finally {
      props.setLoading(false);
    }
  }
})(FormForgotPassword);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setRestBarClass: setRestBarClassAction,
      showErrorNotification: showErrorNotificationAction,
      setLoading: setLoadingAction,
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));