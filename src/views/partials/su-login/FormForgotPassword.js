import React from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {bindActionCreators} from "redux";
import {setLoadingAction, setRestBarClassAction, showErrorNotificationAction} from "../../../redux/action/ui";
import ConfirmModal from "../../components/ConfirmModal";
import {requestResetPassword} from "../../../http";
import backIcon from "../../../assets/images/back.svg";
import history from "../../../history";

const formSchema = (t) => {
  return Yup.object().shape({
    email: Yup.string()
      .required(t('your email required'))
      .email(t("email invalid"))
      .max(1024, t('email max error')),
  });
};

const FormForgotPassword = (props) => {
  const {values, errors, touched, t, setFieldValue, setRestBarClass, status, setStatus} = props;

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
      </div>

      <div className='mt-80'>
        <button
          className={`button ${values['email'] ? "active cursor-pointer" : "inactive cursor-default"}`}
          type={values['email'] ? "submit" : "button"}
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
            return;
          }}
        />
      }
    </Form>
  )
}

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    email: '',
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props, setSubmitting, setStatus}) => {
    try {
      props.setLoading(true);
      await requestResetPassword(values?.email);
      setStatus({visibleModal: true});
    } catch (e) {
      if (e.response?.data?.status?.toString() === "404") { // if user not found
        props.showErrorNotification(props.t("forgot password email not registered"));
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