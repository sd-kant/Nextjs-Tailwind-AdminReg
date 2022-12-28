import React, {useEffect} from 'react';
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
import {
  checkPhoneNumberValidation,
  getParamFromUrl
} from "../../../utils";
import CustomPhoneInput from "../../components/PhoneInput";
import style from "./FormPhoneRegister.module.scss";
import clsx from "clsx";
import {get} from "lodash";
import {setMobileTokenAction} from "../../../redux/action/auth";
import backIcon from "../../../assets/images/back.svg";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const formSchema = (t) => {
  return Yup.object().shape({
    phoneNumber: Yup.object()
      .required(t('phone number required'))
      .test(
        'is-valid',
        t('phone number invalid'),
        function (obj) {
          return checkPhoneNumberValidation(obj.value, obj.countryCode);
        },
      ),
  });
};

const MobileFormPhoneRegister = (props) => {
  const {
    values,
    errors,
    touched,
    t,
    setFieldValue,
    setRestBarClass,
    setToken
  } = props;
  const navigate = useNavigate();

  useEffect(() => {
    setClassName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setClassName = () => {
    setRestBarClass(`progress-50`);
  };

  return (
    <Form className='form-group mt-57'>
      <div>
        <div
          className="d-inline-flex align-center cursor-pointer"
          onClick={() => {
            setToken(null);
            navigate('/mobile-login');
          }}
        >
          <img src={backIcon} alt="back"/>
          &nbsp;&nbsp;
          <span className='font-button-label text-orange text-uppercase'>
            {t("back to login")}
          </span>
        </div>

        <div className='d-flex mt-15 flex-column'>
          <label className='font-heading-small text-capitalize'>
            {t("2fa")}
          </label>
        </div>

        <div className='mt-15'>
          <span className={"font-binary"}>
            {t("2fa description")}
          </span>
        </div>

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
      </div>

      <div className='mt-80'>
        <button
          className={`button ${values?.['phoneNumber']?.value ? "active cursor-pointer" : "inactive cursor-default"}`}
          type={values?.['phoneNumber']?.value ? "submit" : "button"}
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
    phoneNumber: '',
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props}) => {
    const {baseUri, token, setLoading, showErrorNotification, navigate} = props;
    if (token && baseUri) {
      try {
        setLoading(true);
        const phoneNumber = `+${values.phoneNumber?.value}`;
        await axios.patch(`${baseUri}/user`, {
          phoneNumber: phoneNumber,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const deviceId = getParamFromUrl("deviceId");
        navigate(`/mobile-phone-verification/0?phoneNumber=${phoneNumber}&deviceId=${deviceId}`);
      } catch (e) {
        showErrorNotification(e.response?.data?.message);
      } finally {
        setLoading(false);
      }
    } else {
      navigate(`/mobile-login`);
    }
  }
})(MobileFormPhoneRegister);

const mapStateToProps = (state) => ({
  token: get(state, 'auth.mobileToken'),
  baseUri: get(state, 'auth.baseUri'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setRestBarClass: setRestBarClassAction,
      showErrorNotification: showErrorNotificationAction,
      setToken: setMobileTokenAction,
      setLoading: setLoadingAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));