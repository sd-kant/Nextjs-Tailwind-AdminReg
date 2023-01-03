import React from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {bindActionCreators} from "redux";
import {
  setLoadingAction,
  setRestBarClassAction,
  showErrorNotificationAction
} from "../../../redux/action/ui";
import ConfirmModal from "../../components/ConfirmModal";
import {
  instance,
  lookupByEmail,
  lookupByPhone,
  recoverUsername,
  recoverUsernameByPhoneNumber
} from "../../../http";
import backIcon from "../../../assets/images/back.svg";
import {useNavigate} from "react-router-dom";
import {apiBaseUrl} from "../../../config";
import {getParamFromUrl} from "../../../utils";
import {checkPhoneNumberValidation} from "../../../utils";
import CustomPhoneInput from "../../components/PhoneInput";
import clsx from "clsx";
import style from "./FormForgotUsername.module.scss";

const formSchema = (t) => {
  return Yup.object().shape({
    mode: Yup.string(),
    email: Yup.string()
      .email(t("email invalid"))
      .max(1024, t('email max error'))
      .test(
        'required',
        t('email required'),
        function (value) {
          return this.parent.mode === "email" ? !!value : true;
        }
      ),
    phoneNumber: Yup.object()
      .test(
        'required',
        t('phone number required'),
        function (obj) {
          return this.parent.mode === "email" ? true : !!obj?.value;
        }
      )
      .test(
        'is-valid',
        t('phone number invalid'),
        function (obj) {
          return this.parent.mode === "email" ? true : checkPhoneNumberValidation(obj.value, obj.countryCode)
        },
      ),
  });
};

const FormForgotUsername = (props) => {
  const {
    values,
    errors,
    touched,
    t,
    setFieldValue,
    status,
    setStatus,
    resetForm
  } = props;
  const navigate = useNavigate();

  const changeFormField = (e) => {
    const {value, name} = e.target;
    setFieldValue(name, value);
  };

  const handlePrevious = () => {
    const from = getParamFromUrl("from");
    if (from === "mobile") {
      navigate('/mobile-login');
    } else {
      navigate('/login');
    }
  };
  const emailMode = React.useMemo(() => {
    return values.mode === "email";
  }, [values.mode]);

  const switchMode = React.useCallback(() => {
    setFieldValue("mode", emailMode ? "phone" : "email");
  }, [setFieldValue, emailMode]);

  React.useEffect(() => {
    resetForm({
      values: {
        mode: values.mode,
        email: '',
        phoneNumber: {
          value: '',
          countryCode: '',
        },
      },
      errors: {},
      touched: {},
    });
  }, [values.mode, resetForm]);

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
            {emailMode ? t("forgot username description1") : t("forgot username phone description1")}
          </label>
        </div>
        <div className='grouped-form'>
          <label className="font-binary d-block">
            {emailMode ? t("forgot username description2") : t("forgot username phone description2")}
          </label>
        </div>
        {
          emailMode ?
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
            </div> :
            <div className={clsx(style.PhoneNumberWrapper, 'd-flex flex-column mt-40')}>
              <label className='font-input-label'>
                {t("phone number")}
              </label>

              <CustomPhoneInput
                containerClass={clsx(style.PhoneNumberContainer)}
                inputClass={clsx(style.PhoneNumberInput)}
                dropdownClass={clsx(style.PhoneNumberDropdown)}
                value={values.phoneNumber?.value}
                onChange={(value, countryCode) => setFieldValue('phoneNumber', {value, countryCode})}
              />
              {
                (touched?.phoneNumber &&
                  errors?.phoneNumber) && (
                  <span className="font-helper-text text-error mt-10">{errors.phoneNumber}</span>
                )
              }
            </div>
        }
        <div className='d-block mt-25'>
          <label className="font-binary mt-8 text-orange cursor-pointer" onClick={switchMode}>
            {emailMode ? t("switch via phone number") : t("switch via email")}
          </label>
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
          header={emailMode ? t("forgot username confirm header") : t("forgot username phone confirm header")}
          subheader={emailMode ? t("forgot username confirm subheader") : t("forgot username phone confirm subheader")}
          onOk={(e) => {
            e.preventDefault();
            setStatus({visibleModal: false});
            handlePrevious();
          }}
        />
      }
    </Form>
  )
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    mode: 'email',
    email: '',
    phoneNumber: {
      value: '',
      countryCode: '',
    },
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props, setStatus}) => {
    try {
      props.setLoading(true);
      instance.defaults.baseURL = apiBaseUrl;
      if (values.mode === "email") {
        const lookupRes = await lookupByEmail(values?.email);
        const {baseUri} = lookupRes.data;
        if (baseUri) {
          instance.defaults.baseURL = lookupRes.data?.baseUri;
        }
        await recoverUsername(values?.email);
        setStatus({visibleModal: true});
      } else {
        const phoneNumber = `+${values.phoneNumber?.value}`;
        const lookupRes = await lookupByPhone(phoneNumber);
        const {baseUri} = lookupRes.data;
        if (baseUri) {
          instance.defaults.baseURL = lookupRes.data?.baseUri;
        }
        await recoverUsernameByPhoneNumber(phoneNumber);
        setStatus({visibleModal: true});
      }
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
