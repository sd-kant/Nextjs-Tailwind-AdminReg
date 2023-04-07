import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import backIcon from "../../../assets/images/back.svg";
import {bindActionCreators} from "redux";
import {useNavigate} from "react-router-dom";
import {checkIfSpacesOnly} from "../../../utils/invite";

export const formShape = t => ({
  firstName: Yup.string()
    .test(
        'is-valid',
        t('firstName required'),
        function (value) {
          return !checkIfSpacesOnly(value);
        }
    )
    .required(t('firstName required'))
    .max(50, t('firstName max error')),
  lastName: Yup.string()
    .test(
        'is-valid',
        t('lastName required'),
        function (value) {
          return !checkIfSpacesOnly(value);
        }
    )
    .required(t('lastName required'))
    .max(50, t('lastName max error')),
});

const formSchema = (t) => {
  return Yup.object().shape(formShape(t));
};

const FormName = (props) => {
  const {
    profile,
    values,
    errors,
    touched,
    t,
    setFieldValue,
    setRestBarClass,
  } = props;
  const navigate = useNavigate();

  useEffect(() => {
    setRestBarClass('progress-18');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile) {
      setFieldValue("firstName", profile.firstName);
      setFieldValue("lastName", profile.lastName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const changeFormField = (e) => {
    const {value, name} = e.target;

    setFieldValue(name, value);
  };

  return (
    <Form className='form-group mt-57'>
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <img src={backIcon} alt="back"/>
          &nbsp;&nbsp;
          <span className='font-button-label text-orange'>
            {t("previous")}
          </span>
        </div>

        <div className='mt-28 form-header-medium'>
          <span className='font-header-medium d-block'>
            {t("name description")}
          </span>
        </div>

        <div className='mt-40 d-flex flex-column'>
          <label className='font-input-label'>
            {t("firstName")}
          </label>

          <input
            className='input input-field mt-10 font-heading-small text-white'
            name="firstName"
            value={values["firstName"]}
            type='text'
            onChange={changeFormField}
          />

          {
            errors.firstName && touched.firstName && (
              <span className="font-helper-text text-error mt-10">{errors.firstName}</span>
            )
          }
        </div>

        <div className='mt-40 d-flex flex-column'>
          <label className='font-input-label'>
            {t("lastName")}
          </label>

          <input
            className='input input-field mt-10 font-heading-small text-white'
            name="lastName"
            type='text'
            value={values["lastName"]}
            onChange={changeFormField}
          />

          {
            errors.lastName && touched.lastName && (
              <span className="font-helper-text text-error mt-10">{errors.lastName}</span>
            )
          }
        </div>
      </div>

      <div className='mt-80'>
        <button
          className={`button ${values['firstName'] && values['lastName'] ? "active cursor-pointer" : "inactive cursor-default"}`}
          type={values['firstName'] && values['lastName'] ? "submit" : "button"}
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
    firstName: '',
    lastName: '',
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: (values, {props}) => {
    try {
      const {updateProfile, navigate} = props;
      updateProfile({
        body: {
          firstName: values["firstName"]?.trim() ?? 'first name',
          lastName: values["lastName"]?.trim() ?? 'last name',
        },
        nextPath: "/create-account/gender",
        navigate,
      });
    } catch (e) {
      console.log("storing values error", e);
    }
  }
})(FormName);

const mapStateToProps = () => ({
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));
