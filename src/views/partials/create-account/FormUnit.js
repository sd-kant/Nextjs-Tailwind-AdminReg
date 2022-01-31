import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import history from "../../../history";
import backIcon from "../../../assets/images/back.svg";
import metricIcon from "../../../assets/images/metric.svg";
import imperialIcon from "../../../assets/images/imperial.svg";
import {Form, withFormik} from "formik";
import * as Yup from "yup";
import {bindActionCreators} from "redux";
import {IMPERIAL, METRIC} from "../../../constant";

const formSchema = (t) => {
  return Yup.object().shape({
    measureType: Yup.string()
      .test(
        'is-valid',
        t('unit required'),
        function (value) {
          return (value !== "");
        }
      ),
  });
};

const FormUnit = (props) => {
  const {t, values, setFieldValue, setRestBarClass, profile} = props;
  useEffect(() => {
    setRestBarClass("progress-45");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile) {
      setFieldValue("measureType", profile.measure);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const navigateTo = (path) => {
    history.push(path);
  }

  return (
    <Form className='form-group mt-57'>
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigateTo('/create-account/dob')}
        >
          <img src={backIcon} alt="back"/>
          &nbsp;&nbsp;
          <span className='font-button-label text-orange'>
          {t("previous")}
        </span>
        </div>

        <div className='mt-28 form-header-medium'>
        <span className='font-header-medium d-block'>
          {t("unit description")}
        </span>
        </div>

        <div className="mt-40 d-flex">
          <div
            className={`tap cursor-pointer ${values["measureType"] === IMPERIAL ? 'active' : ''}`}
            onClick={() => setFieldValue("measureType", IMPERIAL)}
          >
            <img src={imperialIcon} alt="imperial icon"/>

            <span className='font-binary mt-8'>
            {t("imperial")}
          </span>
          </div>

          <div
            className={`ml-40 cursor-pointer tap ${values["measureType"] === METRIC ? 'active' : ''}`}
            onClick={() => setFieldValue("measureType", METRIC)}
          >
            <img src={metricIcon} alt="metric icon"/>

            <span className='font-binary mt-8'>
            {t("metric")}
          </span>
          </div>
        </div>
      </div>

      <div className='mt-80'>

        <button
          className={`button ${values["measureType"] ? "active cursor-pointer" : "inactive cursor-default"}`}
          type={values["measureType"] ? "submit" : "button"}
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
    measureType: "",
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: (values, {props}) => {
    try {
      props.updateProfile({
        body: {
          measure: values["measureType"],
        },
        nextPath: "/create-account/height",
        apiCall: false,
      })
    } catch (e) {
      console.log("storing values error", e);
    }
  }
})(FormUnit);

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