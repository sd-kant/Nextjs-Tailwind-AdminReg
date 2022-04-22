import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import backIcon from "../../../assets/images/back.svg";
import maleIcon from "../../../assets/images/male.svg";
import femaleIcon from "../../../assets/images/female.svg";
import {Form, withFormik} from "formik";
import * as Yup from "yup";
import {bindActionCreators} from "redux";
import {useNavigate} from "react-router-dom";
import {FEMALE, MALE} from "../../../constant";

export const formShape = t => ({
  gender: Yup.string()
    .test(
      'is-valid',
      t('gender required'),
      function (value) {
        return (value !== "");
      }
    ),
});

const formSchema = (t) => {
  return Yup.object().shape(formShape(t));
};

const FormGender = (props) => {
  const {t, values, setFieldValue, setRestBarClass, profile} = props;
  const navigate = useNavigate();
  useEffect(() => {
    setRestBarClass("progress-27");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (profile) {
      setFieldValue("gender", profile.sex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const navigateTo = (path) => {
    navigate(path);
  }

  return (
    <Form className='form-group mt-57'>
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigateTo('/create-account/name')}
        >
          <img src={backIcon} alt="back"/>
          &nbsp;&nbsp;
          <span className='font-button-label text-orange'>
          {t("previous")}
        </span>
        </div>

        <div className='mt-28 form-header-medium'>
        <span className='font-header-medium d-block'>
          {t("gender question")}
        </span>
        </div>

        <div className="mt-40 d-flex">
          <div
            className={`tap cursor-pointer ${values["gender"]?.toString() === MALE ? 'active' : ''}`}
            onClick={() => setFieldValue("gender", MALE)}
          >
            <img src={maleIcon} alt="male icon"/>

            <span className='font-binary mt-8'>
            {t("male")}
          </span>
          </div>

          <div
            className={`ml-40 cursor-pointer tap ${values["gender"]?.toString() === FEMALE ? 'active' : ''}`}
            onClick={() => setFieldValue("gender", FEMALE)}
          >
            <img src={femaleIcon} alt="female icon"/>

            <span className='font-binary mt-8'>
            {t("female")}
          </span>
          </div>
        </div>
      </div>

      <div className='mt-80'>

        <button
          className={`button ${[MALE, FEMALE].includes(values["gender"]?.toString()) ? "active cursor-pointer" : "inactive cursor-default"}`}
          type={[MALE, FEMALE].includes(values["gender"]?.toString()) ? "submit" : "button"}
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
    gender: "",
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: (values, {props}) => {
    try {
      const {updateProfile, navigate} = props;
      updateProfile({
        body: {
          sex: values["gender"],
        },
        nextPath: '/create-account/dob',
        navigate,
      })
    } catch (e) {
      console.log("storing values error", e);
    }
  }
})(FormGender);

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