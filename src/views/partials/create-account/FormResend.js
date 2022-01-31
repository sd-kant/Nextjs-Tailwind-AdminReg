import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import history from "../../../history";
import {bindActionCreators} from "redux";

const formSchema = (t) => {
  return Yup.object().shape({
    email: Yup.string()
      .required(t('email required'))
      .email(t("email invalid"))
      .max(1024, t('email max error')),
  });
};

const FormResend = (props) => {
  const {values, errors, touched, t, setFieldValue, setRestBarClass} = props;

  useEffect(() => {
    setRestBarClass('progress-0');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeFormField = (e) => {
    const {value, name} = e.target;

    setFieldValue(name, value);
  }

  const navigateTo = (path) => {
    history.push(path);
  }

  return (
    <Form className='form-group mt-57'>
      <div>
        <div className='form-header-medium'>
        <span className='font-header-medium d-block text-capitalize'>
          {t("resend invitation")}
        </span>
        </div>

        <div className='mt-40 d-flex flex-column'>
          <label className='font-input-label text-capitalize'>
            {t("enter email")}
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

        <div className='mt-25 d-flex flex-column'>
          <label className='font-input-label text-orange'>
            {t("invitation expired description")}
          </label>
        </div>
      </div>

      <div className='mt-80 resend-footer'>
        <button
          className={`button ${values['email'] ? "active cursor-pointer" : "inactive cursor-default"}`}
          type={values['email'] ? "submit" : "button"}
        >
          <span className='font-button-label text-white text-uppercase'>
            {t("resend")}
          </span>
        </button>

        <span className="font-button-label text-orange text-uppercase ml-40 cursor-pointer skip" onClick={() => navigateTo("/create-account/password")}>
          {t("skip")}
        </span>
      </div>
    </Form>
  )
}

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    email: '',
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: () => {

  }
})(FormResend);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));