import React, {useEffect} from 'react';
import {withTranslation} from "react-i18next";
import InputMask from 'react-input-mask';
import backIcon from "../../../assets/images/back.svg";
import {Form, withFormik} from "formik";
import * as Yup from "yup";
import {IMPERIAL, METRIC} from "../../../constant";
import {
  convertCmToImperial,
  convertCmToMetric,
  convertImperialToMetric
} from "../../../utils";
import {useNavigate} from "react-router-dom";

export const ftOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
export const inOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export const formShape = t => ({
  heightUnit: Yup.string(),
  feet: Yup.string()
    .test(
      'is-valid',
      t('feet invalid'),
      function (value) {
        if (this.parent.heightUnit !== "2") {
          return parseInt(value) < 10;
        }
        return true;
      }
    ),
  inch: Yup.string()
    .test(
      'is-valid',
      t('inch invalid'),
      function (value) {
        if (this.parent.heightUnit !== "2") {
          return parseInt(value) < 12;
        }
        return true;
      }
    ),
  height: Yup.string()
    .test(
      'is-valid',
      t('height invalid'),
      function (value) {
        if (this.parent.heightUnit !== "1") {
          const strArr = value && value.split("cm");
          const cmArr = strArr && strArr[0] && strArr[0].split('m');
          const m = (cmArr && cmArr[0]) || "0";
          const cm = (cmArr && cmArr[1]) || "00";

          if (cm && cm.includes("_")) {
            return false;
          }
          if (parseInt(m) > 2) {
            return false;
          }

          if (parseInt(m) === 0 && parseInt(cm) < 50) {
            return false;
          }

          return !(parseInt(m) === 2 && parseInt(cm) > 30);
        }
        return true;
      }
    ),
});

const formSchema = (t) => {
  return Yup.object().shape(formShape(t));
};

const FormHeight = (props) => {
  const {
    t,
    values,
    setFieldValue,
    setRestBarClass,
    errors,
    touched,
    profile
  } = props;
  const navigate = useNavigate();

  useEffect(() => {
    setRestBarClass('progress-54');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile) {
      const {measure, height} = profile;
      if (measure === IMPERIAL) {
        const {feet, inch} = convertCmToImperial(height);
        setFieldValue("feet", feet);
        setFieldValue("inch", inch);
        setFieldValue("heightUnit", "1");
      } else if (measure === METRIC) {
        const {m, cm} = convertCmToMetric(height);
        setFieldValue("height", `${m}m${cm}cm`);
        setFieldValue("heightUnit", "2");
      } else {
        navigate("/create-account/unit");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const onChange = (value) => {
    setFieldValue("height", value);
  };

  return (
    <Form className='form-group mt-57'>
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigate('/create-account/unit')}
        >
          <img src={backIcon} alt="back"/>
          &nbsp;&nbsp;
          <span className='font-button-label text-orange'>
            {t("previous")}
          </span>
        </div>

        <div className='mt-28 form-header-medium'>
          <span className='font-header-medium d-block'>
            {t("height question")}
          </span>
        </div>

        <div className="mt-40 d-flex flex-column">
          <div className="d-flex align-center">
            <label className='font-input-label'>
              {t("height")}
            </label>
          </div>

          {
            values["heightUnit"] === "1" ? (
              <div className="d-flex mt-25">
                <div className="unit-picker">
                  <select
                    className="font-input-label text-white"
                    value={values["feet"]}
                    onChange={(e) => {
                      setFieldValue("feet", e.target.value);
                    }}
                  >
                    {
                      ftOptions && ftOptions.map(ftOption => (
                        <option value={ftOption} key={`ft-${ftOption}`}>
                          {ftOption}
                        </option>
                      ))
                    }
                  </select>
                </div>
                &nbsp;&nbsp;
                <label>
                  {t("feet")}
                </label>
                &nbsp;&nbsp;
                <div className="unit-picker">
                  <select
                    className="font-input-label text-white"
                    value={values["inch"]}
                    onChange={(e) => {
                      setFieldValue("inch", e.target.value);
                    }}
                  >
                    {
                      inOptions && inOptions.map(inOption => (
                        <option value={inOption} key={`ft-${inOption}`}>
                          {inOption}
                        </option>
                      ))
                    }
                  </select>
                </div>
                &nbsp;&nbsp;
                <label>
                  {t("inch")}
                </label>
              </div>
            ): (
              <InputMask
                className='d-block input input-field mt-10 font-heading-small text-white'
                placeholder={`_m__cm`}
                mask={`9m99cm`}
                value={values["height"]}
                onChange={e => onChange(e.target.value)}
              />
            )
          }

          {
            (errors.height && touched.height) && (
              <span className="font-helper-text text-error mt-10">{errors.height}</span>
            )
          }

          {
            ((errors.feet && touched.feet) || (errors.inch && touched.inch)) &&
            <span className="font-helper-text text-error mt-10">{t("height invalid")}</span>
          }
        </div>
      </div>

      <div className='mt-80'>
        <button
          className={`button active cursor-pointer`}
          type={"submit"}
        >
          <span className='font-button-label text-white'>
            {t("next")}
          </span>
        </button>
      </div>
    </Form>
  )
};

export const getHeightAsMetric = ({measure, feet, inch, height}) => {
  if (measure === IMPERIAL) {
    const {m, cm} = convertImperialToMetric(`${feet}ft${inch}in`);
    return (parseInt(m) * 100) + parseInt(cm);
  } else {
    return height?.replaceAll('m', '').replaceAll('c', '');
  }
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    heightUnit: "1",
    height: "",
    feet: "1",
    inch: "0"
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: (values, {props}) => {
    try {
      const {updateProfile, navigate, profile} = props;
      let payload = {
        measure: profile?.measure,
      };
      const height = getHeightAsMetric({
        measure: profile?.measure,
        height: values.height,
        feet: values.feet,
        inch: values.inch,
      });
      updateProfile({
        body: {...payload, height},
        nextPath: '/create-account/weight',
        navigate,
      });
    } catch (e) {
      console.log("storing values error", e);
    }
  }
})(FormHeight);

export default withTranslation()(EnhancedForm);