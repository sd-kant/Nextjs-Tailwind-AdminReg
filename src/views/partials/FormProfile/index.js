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
import maleGrayIcon from "../../../assets/images/male-gray.svg";
import femaleIcon from "../../../assets/images/female.svg";
import femaleGrayIcon from "../../../assets/images/female-gray.svg";
import "react-modern-calendar-datepicker/lib/DatePicker.css";
import DatePicker from "react-modern-calendar-datepicker";
import {IMPERIAL, METRIC} from "../../../constant";
import imperialIcon from "../../../assets/images/imperial.svg";
import imperialGrayIcon from "../../../assets/images/imperial-gray.svg";
import metricIcon from "../../../assets/images/metric.svg";
import metricGrayIcon from "../../../assets/images/metric-gray.svg";
import {formShape as nameFormShape} from "../create-account/FormName";
import {formShape as genderFormShape} from "../create-account/FormGender";
import {CustomInput, formShape as dobFormShape, makeDobStr} from "../create-account/FormBirth";
import {formShape as unitFormShape} from "../create-account/FormUnit";
import {ftOptions, inOptions, formShape as heightFormShape, getHeightAsMetric} from "../create-account/FormHeight";
import {formShape as weightFormShape} from "../create-account/FormWeight";
import {formShape as timezoneFormShape} from "../create-account/FormTimezone";
import {formShape as workLengthFormShape} from "../create-account/FormWorkLength";
import {formShape as startWorkFormLength, hourTo24Hour} from "../create-account/FormStartWork";
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
import {getMedicalResponsesAction, updateMyProfileAction} from "../../../redux/action/profile";
import MedicalQuestions from "../MedicalQuestions";
import clsx from "clsx";
import style from "./FormProfile.module.scss";
import TrueFalse from "../../components/TrueFalse";
import Button from "../../components/Button";
import history from "../../../history";
import {ScrollToFieldError} from "../../components/ScrollToFieldError";
import {answerMedicalQuestionsV2} from "../../../http";

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
    medicalResponses,
    getMedicalResponses,
    status: {confirmedCnt},
    setStatus,
  } = props;
  const [edit, setEdit] = React.useState(false);
  const [selectedDay, setSelectedDay] = React.useState(null);
  const [timezones] = useTimezone();
  const [hourOptions, minuteOptions] = useTimeOptions();
  const [cnt, setCnt] = React.useState(0);

  useEffect(() => {
    getMedicalResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    setFieldValue("responses", medicalResponses?.responses);
  }, [medicalResponses, confirmedCnt, setFieldValue]);
  useEffect(() => {
    if (profile) {
      setEdit(false);
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
  }, [setFieldValue, profile, timezones, confirmedCnt]);
  React.useLayoutEffect(() => {
    setCnt(cnt => cnt + 1);
    if (cnt > 1) { // according to length of dependency array of this useLayoutEffect
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
  const changes = React.useMemo(() => {
    const ret = [];
    if (!profile || !values)
      return ret;
    const {
      firstName, lastName, gender,
      measureType, timezone, workLength,
      startTimeOption, hour, minute,
      responses,
    } = values;

    if (firstName !== profile?.firstName) {
      ret.push("firstName");
    }
    if (lastName !== profile?.lastName) {
      ret.push("lastName");
    }
    if (gender?.toString() !== profile?.sex?.toString()) {
      ret.push("gender");
    }
    if (`${selectedDay?.year}-${selectedDay?.month}-${selectedDay?.day}` !== profile?.dateOfBirth) {
      ret.push("dob");
    }
    if (measureType !== profile?.measure) {
      ret.push("measureType");
    }
    if (measureType === IMPERIAL) {
      if (values?.feet && values?.inch) {
        const {m, cm} = convertImperialToMetric(`${values?.feet}ft${values?.inch}in`);
        if (((m * 100) + parseInt(cm)).toString() !== profile?.height?.toString()) {
          ret.push("height");
        }
      }
      if (values?.weight) {
        const kilos = convertLbsToKilos(values?.weight);
        if (kilos?.toString() !== profile?.weight?.toString()) {
          ret.push("weight");
        }
      }
    } else if (measureType === METRIC) {
      if (values?.height) {
        const cm = values?.height?.replaceAll('m', '')?.replaceAll('c', '');
        if (cm !== profile?.height?.toString()) {
          ret.push("height");
        }
      }
      if (values?.weight) {
        if (values?.weight?.toString() !== profile?.weight?.toString()) {
          ret.push("weight");
        }
      }
    }
    const option = timezones?.find(it => it.gmtTz === profile?.gmt);
    if (timezone?.gmtTz !== option?.gmtTz) {
      ret.push("timezone");
    }
    if (workLength?.toString() !== profile?.workDayLength?.toString()) {
      ret.push("workLength");
    }
    const hour24 = hourTo24Hour({startTimeOption, hour});
    if (`${format2Digits(hour24)}:${minute}` !== profile?.workDayStart) {
      ret.push("workDayStart");
    }
    medicalResponses?.responses?.forEach(it => {
      if (!responses?.some(ele => ele.questionId?.toString() === it.questionId?.toString() && ele.answerId?.toString() === it.answerId?.toString())) {
        ret.push(`medicalQuestion-${it.questionId}`);
      }
    })

    return ret;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, profile, selectedDay, timezones, medicalResponses, confirmedCnt]);

  const changeFormField = (e) => {
    const {value, name} = e.target;
    setFieldValue(name, value);
  }
  useEffect(() => {
    setFieldValue("dob", selectedDay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);
  const unitOptions = [
    {
      value: IMPERIAL,
      title: t('imperial'),
      icons: {active: imperialIcon, inactive: imperialGrayIcon},
    },
    {
      value: METRIC,
      title: t('metric'),
      icons: {active: metricIcon, inactive: metricGrayIcon},
    },
  ];
  const genderOptions = [
    {
      value: 0,
      title: t('male'),
      icons: {active: maleIcon, inactive: maleGrayIcon},
    },
    {
      value: 1,
      title: t('female'),
      icons: {active: femaleIcon, inactive: femaleGrayIcon},
    },
  ];

  return (
    <Form className='form-group mt-10'>
      {
        edit ?
          <div className={clsx('form-header-medium', style.Head)}><span
            className='font-heading-small d-block'>{changes?.length > 0 ? changes?.length : 'No'} New Change</span>
          </div> :
          <div className={clsx('form-header-medium', style.HeadLeft)}><span
            className='font-button-label d-block text-orange'
            onClick={() => setEdit(true)}
          >Edit</span></div>
      }
      <div className={clsx(style.ContentWrapper, 'form-header-medium')}>
        <ScrollToFieldError/>
        {/*name section*/}
        <div className='mt-10 form-header-medium'><span
          className='font-header-medium d-block'>{t("name description")}</span></div>
        <div className='mt-15 d-flex flex-column'>
          <label className='font-input-label'>
            {t("firstName")}
          </label>

          <input
            className={`input input-field mt-10 font-heading-small ${edit ? 'text-white' : 'text-gray'}`}
            name="firstName"
            value={values["firstName"]}
            disabled={!edit}
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
            className={`input input-field mt-10 font-heading-small ${edit ? 'text-white' : 'text-gray'}`}
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
        <div className='mt-28 form-header-medium'><span
          className='font-header-medium d-block'>{t("gender question")}</span></div>
        <div className="mt-15 d-flex">
          <TrueFalse
            disabled={!edit}
            answer={values["gender"]}
            options={genderOptions}
            onChange={v => changeFormField({target: {name: 'gender', value: v}})}
          />
        </div>
        {/*birthday section*/}
        <div className='mt-28 form-header-medium'><span
          className='font-header-medium d-block'>{t("dob question")}</span></div>
        <div className="mt-15 d-flex flex-column">
          <label className='font-input-label'>
            {t("dob")}
          </label>
          <DatePicker
            value={selectedDay}
            colorPrimary={'#DE7D2C'}
            renderInput={({ref}) => {
              return <CustomInput ref={ref} selectedDay={selectedDay} disabled={!edit}/>
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
        <div className='mt-28 form-header-medium'><span
          className='font-header-medium d-block'>{t("unit description")}</span></div>
        <div className="mt-15 d-flex">
          <TrueFalse
            disabled={!edit}
            answer={values["measureType"]}
            options={unitOptions}
            onChange={v => changeFormField({target: {name: 'measureType', value: v}})}
          />
        </div>
        {/*height section*/}
        <div className='mt-28 form-header-medium'><span
          className='font-header-medium d-block'>{t("height question")}</span></div>
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
                    className={`font-input-label ${edit ? 'text-white' : 'text-gray'}`}
                    value={values["feet"]}
                    name="feet"
                    disabled={!edit}
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
                    className={`font-input-label ${edit ? 'text-white' : 'text-gray'}`}
                    value={values["inch"]}
                    name="inch"
                    disabled={!edit}
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
            ) : (
              <InputMask
                className={`d-block input input-field mt-10 font-heading-small ${edit ? 'text-white' : 'text-gray'}`}
                placeholder={`_m__cm`}
                mask={`9m99cm`}
                value={values["height"]}
                disabled={!edit}
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
        <div className='mt-28 form-header-medium'><span
          className='font-header-medium d-block'>{t("weight question")}</span></div>
        <div className="mt-15 d-flex flex-column">
          <div className="d-flex align-center">
            <label className='font-input-label'>
              {t("weight")}
            </label>
          </div>

          <input
            className={`input input-field mt-10 font-heading-small ${edit ? 'text-white' : 'text-gray'}`}
            type='number'
            disabled={!edit}
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
        <div className='mt-28 form-form-header-medium'><span
          className='font-header-medium d-block'>{t("timezone question")}</span></div>
        <div className="mt-15 d-flex flex-column">
          <label className='font-input-label'>
            {t("timezone")}
          </label>

          <Select
            className='mt-10 font-heading-small text-black input-field'
            options={timezones}
            value={values["timezone"]}
            isDisabled={!edit}
            placeholder={t("select")}
            styles={customStyles}
            onChange={v => setFieldValue("timezone", v)}
          />
        </div>
        {/*work length section*/}
        <div className='mt-28 form-header-medium'><span
          className='font-header-medium d-block'>{t("work length question")}</span></div>
        <div className="mt-15 d-flex flex-column">
          <label className='font-input-label'>
            {t("work length")}
          </label>
          <input
            className={`input input-field mt-10 font-heading-small ${edit ? 'text-white' : 'text-gray'}`}
            type='number'
            name="workLength"
            disabled={!edit}
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
        <div className='mt-28 form-header-medium'><span
          className='font-header-medium d-block'>{t("start work question")}</span></div>
        <div className="mt-15 d-flex flex-column">
          <label className='font-input-label'>
            {t("start work")}
          </label>
          <div className="d-flex mt-25">
            <div className="unit-picker">
              <select
                className={`font-input-label ${edit ? 'text-white' : 'text-gray'}`}
                value={values["hour"]}
                name="hour"
                disabled={!edit}
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
                className={`font-input-label ${edit ? 'text-white' : 'text-gray'}`}
                value={values["minute"]}
                name="minute"
                disabled={!edit}
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
                className={`font-input-label ${edit ? 'text-white' : 'text-gray'}`}
                value={values["startTimeOption"]}
                name="startTimeOption"
                disabled={!edit}
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
        <MedicalQuestions
          edit={edit}
          responses={values?.responses}
          setResponses={v => setFieldValue("responses", v)}
        />
      </div>


      <div className='mt-40'>
        {
          edit ?
            <div>
              <button
                className={"button active cursor-pointer"}
                type={"submit"}
              ><span className='font-button-label text-white text-uppercase'>{t("save & close")}</span>
              </button>

              <button
                className={`button cursor-pointer cancel ml-15`}
                type={"button"}
                onClick={() => {
                  setStatus({confirmedCnt: confirmedCnt + 1});
                }}
              ><span className='font-button-label text-orange text-uppercase'>{t("cancel")}</span>
              </button>
            </div>
            :
            <Button
              size='md'
              color="white"
              bgColor="gray"
              borderColor="gray"
              title={t("cancel")}
              onClick={() => history.back()}
            />
        }
      </div>

    </Form>
  )
}

const EnhancedForm = withFormik({
  mapPropsToStatus: () => ({
    confirmedCnt: 0,
  }),
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
  handleSubmit: async (values, {props}) => {
    const {
      updateProfile, token, t,
      getMedicalResponses, showErrorNotification,
    } = props;
    try {
      const {
        gender,
        startTimeOption, hour, minute,
        dob: {year, month, day},
        measureType, height, feet, inch, weight,
        timezone: {gmtTz},
        workLength,
        responses,
      } = values;
      const dobStr = makeDobStr({year, month, day});
      const measure = measureType;
      const heightAsMetric = getHeightAsMetric({
        measure: measure,
        height: height,
        feet: feet,
        inch: inch,
      });
      let weightAsMetric = weight;
      if (measure === IMPERIAL) {
        weightAsMetric = convertLbsToKilos(values?.weight);
      }
      const hour24 = hourTo24Hour({startTimeOption, hour});
      const body = {
        ...values,
        sex: gender,
        dateOfBirth: dobStr,
        measure: measure,
        height: heightAsMetric,
        weight: weightAsMetric,
        gmt: gmtTz ?? "GMT+00:00",
        workDayLength: workLength,
        workDayStart: `${format2Digits(hour24)}:${minute}`,
      };
      updateProfile({body, apiCall: true});
      const medicalQuestionData = {
        category: 'medical',
        ts: new Date().toISOString(),
        gmt: gmtTz?.toLowerCase()?.replace("gmt", "") ?? "+00:00",
        responses: responses,
      };
      await answerMedicalQuestionsV2(medicalQuestionData, token);
      getMedicalResponses();
      history.back();
    } catch (e) {
      console.error("save profile error", e);
      showErrorNotification(e.response?.data?.message || t("msg something went wrong"));
    }
  }
})(FormProfile);

const mapStateToProps = (state) => ({
  token: get(state, 'auth.token'),
  profile: get(state, 'profile.profile'),
  medicalResponses: get(state, 'profile.medicalResponses'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setRestBarClass: setRestBarClassAction,
      loginAction: loginAction,
      showErrorNotification: showErrorNotificationAction,
      getMedicalResponses: getMedicalResponsesAction,
      updateProfile: updateMyProfileAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));
