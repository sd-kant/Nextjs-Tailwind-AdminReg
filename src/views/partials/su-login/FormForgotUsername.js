import React from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {bindActionCreators} from "redux";
import {setLoadingAction, setRestBarClassAction, showErrorNotificationAction} from "../../../redux/action/ui";
import ConfirmModal from "../../components/ConfirmModal";
import {instance, lookupByEmail, recoverUsername} from "../../../http";
import backIcon from "../../../assets/images/back.svg";
import {useNavigate} from "react-router-dom";
import {apiBaseUrl} from "../../../config";
import {getParamFromUrl} from "../../../utils";

const formSchema = (t) => {
  return Yup.object().shape({
    email: Yup.string()
      .required(t('email required'))
      .email(t("email invalid"))
      .max(1024, t('email max error')),
  });
};

const FormForgotUsername = (props) => {
  const {values, errors, touched, t, setFieldValue, status, setStatus} = props;
  const navigate = useNavigate();

  const changeFormField = (e) => {
    const {value, name} = e.target;
    setFieldValue(name, value);
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

        <div className='grouped-form mt-25'>
          <label className="font-binary d-block mt-8">
            {t("forgot username description1")}
          </label>
        </div>
        <div className='grouped-form'>
          <label className="font-binary d-block">
            {t("forgot username description2")}
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
          className={"button active cursor-pointer"}
          type={"submit"}
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
          header={t("forgot username confirm header")}
          subheader={t("forgot username confirm subheader")}
          onOk={(e) => {
            e.preventDefault();
            setStatus({visibleModal: false});
            handlePrevious();
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
  handleSubmit: async (values, {props, setStatus}) => {
    try {
      props.setLoading(true);
      instance.defaults.baseURL = apiBaseUrl;
      const lookupRes = await lookupByEmail(values?.email);
      const {baseUri} = lookupRes.data;
      if (baseUri) {
        instance.defaults.baseURL = lookupRes.data?.baseUri;
      }
      await recoverUsername(values?.email);
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
})(FormForgotUsername);

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
