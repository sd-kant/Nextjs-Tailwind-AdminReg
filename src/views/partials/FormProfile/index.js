import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import {get} from "lodash";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import InputMask from 'react-input-mask';
import {bindActionCreators} from "redux";
import {setRestBarClassAction, showErrorNotificationAction} from "../../../redux/action/ui";
import {loginAction} from "../../../redux/action/auth";
import maleIcon from "../../../assets/images/male.svg";
import femaleIcon from "../../../assets/images/female.svg";
import "react-modern-calendar-datepicker/lib/DatePicker.css";
import DatePicker from "react-modern-calendar-datepicker";
import {IMPERIAL, METRIC} from "../../../constant";
import imperialIcon from "../../../assets/images/imperial.svg";
import metricIcon from "../../../assets/images/metric.svg";
import {formShape as nameFormShape} from "../create-account/FormName";
import {formShape as genderFormShape} from "../create-account/FormGender";
import {CustomInput, formShape as dobFormShape} from "../create-account/FormBirth";
import {formShape as unitFormShape} from "../create-account/FormUnit";
import {ftOptions, inOptions, formShape as heightFormShape} from "../create-account/FormHeight";
import {formShape as weightFormShape} from "../create-account/FormWeight";
import {formShape as timezoneFormShape} from "../create-account/FormTimezone";
import {formShape as workLengthFormShape} from "../create-account/FormWorkLength";
import {formShape as startWorkFormLength} from "../create-account/FormStartWork";
import Select from "react-select";
import {customStyles} from "../create-account/FormCountry";
import useTimezone from "../../../hooks/useTimezone";
import useTimeOptions from "../../../hooks/useTimeOptions";
import {options as mOptions} from "../create-account/FormStartWork";
import {
  convertCmToImperial,
  convertCmToMetric,
  convertImperialToMetric,
  convertKilosToLbs, convertLbsToKilos,
  format2Digits
} from "../../../utils";
import {getMedicalQuestionsAction, getMedicalResponsesAction} from "../../../redux/action/profile";
import MedicalQuestions from "../MedicalQuestions";
import clsx from "clsx";
import style from "./FormProfile.module.scss";

export const formSchema = (t) => {
  return Yup.object().shape({
    ...nameFormShape(t),
    ...genderFormShape(t),
    ...dobFormShape(t),
    ...unitFormShape(t),
    ...heightFormShape(t),
    ...weightFormShape(t),
    ...timezoneFormShape(t),
    ...workLengthFormShape(t),
    ...startWorkFormLength(t),
  });
};

const FormProfile = (props) => {
  const {
    values,
    errors,
    touched,
    t,
    setFieldValue,
    profile,
    getMedicalQuestions,
    getMedicalResponses,
  } = props;
  const [selectedDay, setSelectedDay] = React.useState(null);
  const [timezones] = useTimezone();
  const [hourOptions, minuteOptions] = useTimeOptions();
  const [cnt, setCnt] = React.useState(0);
  useEffect(() => {
    getMedicalQuestions();
    getMedicalResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (profile) {
      setFieldValue("firstName", profile.firstName);
      setFieldValue("lastName", profile.lastName);
      setFieldValue("gender", profile.sex);
      const dateOfBirth = profile.dateOfBirth;
      const dobSplits = dateOfBirth?.split("-");
      if (dobSplits?.length === 3) {
        setSelectedDay({
          year: parseInt(dobSplits[0]),
          month: parseInt(dobSplits[1]),
          day: parseInt(dobSplits[2]),
        })
      }
      setFieldValue("measureType", profile.measure);
      const {measure, height, weight, workDayStart} = profile;
      if (measure === IMPERIAL) {
        setFieldValue("heightUnit", "1");
        setFieldValue("weightUnit", "1");
        setFieldValue("weight", convertKilosToLbs(weight));
      } else if (measure === METRIC) {
        setFieldValue("heightUnit", "2");
        setFieldValue("weightUnit", "2");
        setFieldValue("weight", weight);
      }
      const {feet, inch} = convertCmToImperial(height);
      setFieldValue("feet", feet);
      setFieldValue("inch", inch);
      const {m, cm} = convertCmToMetric(height);
      setFieldValue("height", `${m}m${cm}cm`);
      const option = timezones?.find(it => it.gmtTz === profile.gmt);
      setFieldValue("timezone", option);
      setFieldValue("workLength", profile.workDayLength);
      if (workDayStart) {
        const hour = workDayStart.split(":")?.[0];
        const minute = workDayStart.split(":")?.[1];
        if (parseInt(hour) === 0) {
          setFieldValue("hour", "12");
        } else if (parseInt(hour) > 12) {
          setFieldValue("hour", format2Digits(parseInt(hour) - 12));
        } else {
          setFieldValue("hour", format2Digits(parseInt(hour)));
        }
        if (parseInt(hour) >= 12) {
          setFieldValue("startTimeOption", "PM");
        } else {
          setFieldValue("startTimeOption", "AM");
        }
        setFieldValue("minute", minute);
      }
    }
  }, [setFieldValue, profile, timezones]);
  React.useLayoutEffect(() => {
    setCnt(cnt => cnt + 1);
    if (cnt > 1) {
      if (values.measureType === IMPERIAL) {
        setFieldValue("heightUnit", "1");
        setFieldValue("weightUnit", "1");
        if (values.height) {
          const cm = values.height?.replaceAll('m', '')?.replaceAll('c', '');
          const {feet, inch} = convertCmToImperial(cm);
          setFieldValue("feet", feet);
          setFieldValue("inch", inch);
        }
        if (values.weight) {
          const lbs = convertKilosToLbs(values.weight);
          setFieldValue("weight", lbs);
        }
      } else if (values.measureType === METRIC) {
        setFieldValue("heightUnit", "2");
        setFieldValue("weightUnit", "2");
        if (values.feet && values.inch) {
          const {m, cm} = convertImperialToMetric(`${values.feet}ft${values.inch}in`);
          setFieldValue("height", `${m}m${cm}cm`);
        }
        if (values.weight) {
          const kilos = convertLbsToKilos(values.weight);
          setFieldValue("weight", kilos);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setFieldValue, values.measureType]);
  React.useLayoutEffect(() => {

  }, [values, profile]);

  const changeFormField = (e) => {
    const {value, name} = e.target;
    setFieldValue(name, value);
  }
  useEffect(() => {
    setFieldValue("dob", selectedDay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);

  return (
    <Form className='form-group mt-10'>
      <div className={clsx('form-header-medium', style.Head)}><span className='font-heading-small d-block'>1 New Change</span></div>
      <div className={clsx(style.ContentWrapper, 'form-header-medium')}>
        {/*username password section*/}
        <div className='mt-10 d-flex flex-column'>
          <label className='font-input-label text-capitalize'>
            {t("username")}
          </label>

          <input
            className='input input-field mt-10 font-heading-small text-white'
            name="username"
            type='text'
            value={values["username"]}
            onChange={changeFormField}
          />

          {
            errors.username && touched.username && (
              <span className="font-helper-text text-error mt-10">{errors.username}</span>
            )
          }
        </div>
        <div className='mt-10 d-flex flex-column'>
          <label className='font-input-label text-capitalize'>
            {t("new password")}
          </label>

          <input
            className='input input-field mt-10 font-heading-small text-white'
            name="newPassword"
            type='password'
            value={values["newPassword"]}
            onChange={changeFormField}
          />

          {
            errors.newPassword && touched.newPassword && (
              <span className="font-helper-text text-error mt-10">{errors.newPassword}</span>
            )
          }
        </div>
        <div className='mt-10 d-flex flex-column'>
          <label className='font-input-label text-capitalize'>
            {t("confirm password")}
          </label>

          <input
            className='input input-field mt-10 font-heading-small text-white'
            name="confirmPassword"
            type='password'
            value={values["confirmPassword"]}
            onChange={changeFormField}
          />

          {
            errors.confirmPassword && touched.confirmPassword && (
              <span className="font-helper-text text-error mt-10">{errors.confirmPassword}</span>
            )
          }
        </div>
        {/*name section*/}
        <div className='mt-28 form-header-medium'><span className='font-header-medium d-block'>{t("name description")}</span></div>
        <div className='mt-15 d-flex flex-column'>
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
        <div className='mt-10 d-flex flex-column'>
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
        {/*gender section*/}
        <div className='mt-28 form-header-medium'><span className='font-header-medium d-block'>{t("gender question")}</span></div>
        <div className="mt-15 d-flex">
          <div
            className={`tap cursor-pointer ${values["gender"]?.toString() === "0" ? 'active' : ''}`}
            onClick={() => setFieldValue("gender", 0)}
          >
            <img src={maleIcon} alt="male icon"/>
            <span className='font-binary mt-8'>{t("male")}</span>
          </div>

          <div
            className={`ml-40 cursor-pointer tap ${values["gender"]?.toString() === "1" ? 'active' : ''}`}
            onClick={() => setFieldValue("gender", 1)}
          >
            <img src={femaleIcon} alt="female icon"/>
            <span className='font-binary mt-8'>{t("female")}</span>
          </div>
        </div>
        {/*birthday section*/}
        <div className='mt-28 form-header-medium'><span className='font-header-medium d-block'>{t("dob question")}</span></div>
        <div className="mt-15 d-flex flex-column">
          <label className='font-input-label'>
            {t("dob")}
          </label>
          <DatePicker
            value={selectedDay}
            colorPrimary={'#DE7D2C'}
            renderInput={({ref}) => {
              return <CustomInput ref={ref} selectedDay={selectedDay}/>
            }}
            onChange={setSelectedDay}
          />
          {
            errors.dob && touched.dob && (
              <span className="font-helper-text text-error mt-10">{errors.dob}</span>
            )
          }
        </div>
        {/*unit section*/}
        <div className='mt-28 form-header-medium'><span className='font-header-medium d-block'>{t("unit description")}</span></div>
        <div className="mt-15 d-flex">
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
        {/*height section*/}
        <div className='mt-28 form-header-medium'><span className='font-header-medium d-block'>{t("height question")}</span></div>
        <div className="mt-15 d-flex flex-column">
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
                    name="feet"
                    onChange={changeFormField}
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
                    name="inch"
                    onChange={changeFormField}
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
                name="height"
                onChange={changeFormField}
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
        {/*weight section*/}
        <div className='mt-28 form-header-medium'><span className='font-header-medium d-block'>{t("weight question")}</span></div>
        <div className="mt-15 d-flex flex-column">
          <div className="d-flex align-center">
            <label className='font-input-label'>
              {t("weight")}
            </label>
          </div>

          <input
            className='input input-field mt-10 font-heading-small text-white'
            type='number'
            value={values["weight"]}
            name="weight"
            step={1}
            onChange={changeFormField}
          />

          {
            errors.weight && touched.weight && (
              <span className="font-helper-text text-error mt-10">{errors.weight}</span>
            )
          }
        </div>
        {/*timezone section*/}
        <div className='mt-28 form-form-header-medium'><span className='font-header-medium d-block'>{t("timezone question")}</span></div>
        <div className="mt-15 d-flex flex-column">
          <label className='font-input-label'>
            {t("timezone")}
          </label>

          <Select
            className='mt-10 font-heading-small text-black input-field'
            options={timezones}
            value={values["timezone"]}
            placeholder={t("select")}
            styles={customStyles}
            onChange={v => setFieldValue("timezone", v)}
          />
        </div>
        {/*work length section*/}
        <div className='mt-28 form-header-medium'><span className='font-header-medium d-block'>{t("work length question")}</span></div>
        <div className="mt-15 d-flex flex-column">
          <label className='font-input-label'>
            {t("work length")}
          </label>
          <input
            className='input input-field mt-10 font-heading-small text-white'
            type='number'
            name="workLength"
            value={values["workLength"]}
            onChange={changeFormField}
          />
          {
            errors.workLength && touched.workLength && (
              <span className="font-helper-text text-error mt-10">{errors.workLength}</span>
            )
          }
        </div>
        {/*start work section*/}
        <div className='mt-28 form-header-medium'><span className='font-header-medium d-block'>{t("start work question")}</span></div>
        <div className="mt-15 d-flex flex-column">
          <label className='font-input-label'>
            {t("start work")}
          </label>
          <div className="d-flex mt-25">
            <div className="unit-picker">
              <select
                className="font-input-label text-white"
                value={values["hour"]}
                name="hour"
                onChange={changeFormField}
              >
                {
                  hourOptions && hourOptions.map(hourOption => (
                    <option value={hourOption} key={`hour-${hourOption}`}>
                      {hourOption}
                    </option>
                  ))
                }
              </select>
            </div>
            &nbsp;&nbsp;:&nbsp;&nbsp;
            <div className="unit-picker">
              <select
                className="font-input-label text-white"
                value={values["minute"]}
                name="minute"
                onChange={changeFormField}
              >
                {
                  minuteOptions && minuteOptions.map(minuteOption => (
                    <option value={minuteOption} key={`minute-${minuteOption}`}>
                      {minuteOption}
                    </option>
                  ))
                }
              </select>
            </div>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <div className="unit-picker">
              <select
                className="font-input-label text-white"
                value={values["startTimeOption"]}
                name="startTimeOption"
                onChange={changeFormField}
              >
                {
                  mOptions?.map(option => (
                    <option value={option.value} key={`option-${option.value}`}>
                      {option.title}
                    </option>
                  ))
                }
              </select>
            </div>
          </div>

          {
            (errors.hour && touched.hour) || (errors.minute && touched.minute) ? (
              <span className="font-helper-text text-error mt-10">{t('start work invalid')}</span>
            ) : null
          }
        </div>
        {/*medical questions*/}
        <MedicalQuestions/>
      </div>

      <div className='mt-40'>
        <div>
          <button
            className={"button active cursor-pointer"}
            type={"submit"}
          >
          <span className='font-button-label text-white text-uppercase'>
            {t("save & close")}
          </span>
          </button>
        </div>
      </div>
    </Form>
  )
}

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    firstName: '',
    lastName: '',
    gender: "",
    dob: '',
    measureType: "",
    heightUnit: "1",
    height: "",
    feet: "1",
    inch: "0",
    weightUnit: "1",
    weight: "",
    timezone: null,
    workLength: "",
    startTimeOption: "AM",
    hour: "09",
    minute: "00",
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: (values, {props}) => {
    console.log("values", values);
    console.log("props", props);
  }
})(FormProfile);

const mapStateToProps = (state) => ({
  profile: get(state, 'profile.profile'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setRestBarClass: setRestBarClassAction,
      loginAction: loginAction,
      showErrorNotification: showErrorNotificationAction,
      getMedicalQuestions: getMedicalQuestionsAction,
      getMedicalResponses: getMedicalResponsesAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));
