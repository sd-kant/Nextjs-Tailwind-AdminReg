import React, {useEffect} from 'react';
import {withTranslation} from "react-i18next";
import history from "../../../history";
import backIcon from "../../../assets/images/back.svg";
import * as Yup from "yup";
import {Form, withFormik} from "formik";
import Select from 'react-select';
import {customStyles} from "./FormCountry";
// import 'react-bootstrap-timezone-picker/dist/react-bootstrap-timezone-picker.min.css';
import spacetime from "spacetime";
import soft from "timezone-soft";
import timezoneList from '../../../constant/timezone-list';

const formSchema = (t) => {
  return Yup.object().shape({
    timezone: Yup.object()
      .required(t("timezone required")),
  });
};

const FormTimezone = (props) => {

  const options = React.useMemo(() => {
    return Object.entries(timezoneList)
      .reduce((selectOptions, zone) => {
      const now = spacetime.now(zone[0]);
      const tz = now.timezone();
      const tzStrings = soft(zone[0]);

      let abbr = now.isDST() ? tzStrings[0].daylight?.abbr : tzStrings[0].standard?.abbr;
      let altName = now.isDST() ? tzStrings[0].daylight?.name : tzStrings[0].standard?.name;

      const min = tz.current.offset * 60;
      const hr =
        `${(min / 60) ^ 0}:` + (min % 60 === 0 ? "00" : Math.abs(min % 60));
      const prefix = `(GMT${hr.includes("-") ? hr : `+${hr}`}) ${zone[1]}`;
      const label = `${prefix}`;
      const formattedHr = `${((min / 60) ^ 0).toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
      })}:` + (min % 60 === 0 ? "00" : Math.abs(min % 60));
      const gmtTz = `GMT${formattedHr.includes("-") ? formattedHr : `+${formattedHr}`}`;

      selectOptions.push({
        value: tz.name,
        label: label,
        offset: tz.current.offset,
        abbrev: abbr,
        altName: altName,
        gmtTz,
      });

      return selectOptions;
    }, [])
      .sort((a, b) => a.offset - b.offset)
  }, []);

  const {t, values, setFieldValue, setRestBarClass, profile} = props;

  useEffect(() => {
    setRestBarClass('progress-81');
  }, []);

  useEffect(() => {
    if (profile) {
      const option = options?.find(it => it.gmtTz === profile.gmt);
      setFieldValue("timezone", option);
    }
  }, [profile, options]);

  const navigateTo = (path) => {
    history.push(path);
  }

  const changeHandler = value => {
    setFieldValue("timezone", value);
  }

  return (
    <Form className='form-group mt-57'>
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigateTo('/create-account/country')}
        >
          <img src={backIcon} alt="back"/>
          &nbsp;&nbsp;
          <span className='font-button-label text-orange'>
          {t("previous")}
        </span>
        </div>

        <div className='mt-28 form-form-header-medium'>
        <span className='font-header-medium d-block'>
          {t("timezone question")}
        </span>
        </div>

        <div className="mt-40 d-flex flex-column">
          <label className='font-input-label'>
            {t("timezone")}
          </label>

          <Select
            className='mt-10 font-heading-small text-black input-field'
            options={options}
            value={values["timezone"]}
            styles={customStyles}
            onChange={changeHandler}
            placeholder={t("select")}
          />
        </div>
      </div>

      <div className='mt-80'>
        <button
          className={`button ${values["timezone"] ? "active cursor-pointer" : "inactive cursor-default"}`}
          type={values["timezone"] ? "submit" : "button"}
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
    timezone: null,
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: (values, {props}) => {
    try {
      props.updateProfile({
        body: {
          gmt: values.timezone?.gmtTz ?? "GMT+00:00",
        },
        nextPath: '/create-account/workLength',
      })
    } catch (e) {
      console.log("storing values error", e);
    }
  }
})(FormTimezone);

export default withTranslation()(EnhancedForm);