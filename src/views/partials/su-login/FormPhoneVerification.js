import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {withTranslation, Trans} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {bindActionCreators} from "redux";
import {setRestBarClassAction} from "../../../redux/action/ui";
import {loginAction} from "../../../redux/action/auth";
import {checkPasswordValidation} from "../../../utils";
import {Link} from "react-router-dom";
import CodeInput from "../../components/CodeInput";

const formSchema = (t) => {
  return Yup.object().shape({
    email: Yup.string()
      .required(t('your email required'))
      .email(t("email invalid"))
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

const FormPhoneVerification = (props) => {
  const {values, errors, touched, t, setFieldValue, setRestBarClass} = props;

  useEffect(() => {
    setClassName();
  });

  const setClassName = () => {
    let sum = 0;
    sum += values["password"] ? 1 : 0;
    sum += values["email"] ? 1 : 0;
    setRestBarClass(`progress-${sum * 50}`);
  }

  return (
    <Form className='form-group mt-57'>
      <div>
        <div className='d-flex flex-column'>
          <label className='font-heading-small text-capitalize'>
            {t("auth code")}
          </label>
        </div>

        <div className='mt-15'>
          <span className={"font-binary"}>
            {t("auth code description")}
          </span>
          &nbsp;
          <span className={"font-binary text-orange"}>
            <Trans
              i18nKey={"auth code number"}
              values={{
                number: 4321,
              }}
            />
          </span>
        </div>

        <div className='mt-40 d-flex flex-column'>
          <CodeInput/>
        </div>

        <div className='mt-40'>
          <span className={"font-binary"}>
            {t("auth code not receive")}
          </span>
          &nbsp;
          <span className={"font-binary text-orange"}>
            {t("auth code resend")}
          </span>
        </div>
      </div>

      <div className='mt-80'>

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
})(FormPhoneVerification);

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