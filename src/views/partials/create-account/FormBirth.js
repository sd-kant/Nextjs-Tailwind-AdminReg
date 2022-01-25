import React, {useEffect} from 'react';
import {withTranslation} from "react-i18next";
import history from "../../../history";
import backIcon from "../../../assets/images/back.svg";
import {Form, withFormik} from "formik";
import * as Yup from "yup";
import "react-modern-calendar-datepicker/lib/DatePicker.css";
import DatePicker from "react-modern-calendar-datepicker";

const formSchema = (t) => {
  return Yup.object().shape({
    dob: Yup.object()
      .required(t("dob required"))
      .test(
        'is-valid',
        t('dob invalid'),
        function (value) {
          if (!value) {
            return false;
          }
          const {year: selectedYear, month: selectedMonth, day: selectedDay} = value;
          if (selectedYear < 1900) {
            return false;
          }
          return (new Date(selectedYear, selectedMonth - 1, selectedDay) < new Date());
        }
      )
      .test(
        'is-18',
        t('dob less 18'),
        function (value) {
          if (!value) {
            return false;
          }
          const {year: selectedYear, month: selectedMonth, day: selectedDay} = value;
          const age = getAge(new Date(selectedYear, selectedMonth - 1, selectedDay));
          return age >= 18;
        }
      ),
  });
};

const getAge = (dateString) => {
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate()))
  {
    age--;
  }
  return age;
}

const FormBirth = (props) => {
  const {t, values, setFieldValue, setRestBarClass, errors, touched, profile} = props;
  const [selectedDay, setSelectedDay] = React.useState(null);
  useEffect(() => {
    setRestBarClass('progress-36');
  }, []);
  useEffect(() => {
    if (profile) {
      const dateOfBirth = profile.dateOfBirth;
      const dobSplits = dateOfBirth?.split("-");
      if (dobSplits?.length === 3) {
        setSelectedDay({
          year: parseInt(dobSplits[0]),
          month: parseInt(dobSplits[1]),
          day: parseInt(dobSplits[2]),
        })
      }
    }
  }, [profile]);
  const navigateTo = (path) => {
    history.push(path);
  }
  useEffect(() => {
    setFieldValue("dob", selectedDay);
  }, [selectedDay]);

  const renderCustomInput = ({ref}) => (
    <input
      readOnly
      ref={ref} // necessary
      className='input input-field mt-10 font-heading-small text-white'
      placeholder="Please pick your birthday"
      value={selectedDay ? new Date(selectedDay.year, selectedDay.month - 1, selectedDay.day).toLocaleDateString() : ''}
      type='text'
    />
  )

  return (
    <Form className='form-group mt-57'>
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigateTo('/create-account/gender')}
        >
          <img src={backIcon} alt="back"/>
          &nbsp;&nbsp;
          <span className='font-button-label text-orange'>
          {t("previous")}
        </span>
        </div>

        <div className='mt-28 form-header-medium'>
        <span className='font-header-medium d-block'>
          {t("dob question")}
        </span>
        </div>

        <div className="mt-40 d-flex flex-column">
          <label className='font-input-label'>
            {t("dob")}
          </label>

          <DatePicker
            value={selectedDay}
            colorPrimary={'#DE7D2C'}
            renderInput={renderCustomInput}
            onChange={setSelectedDay}
          />

          {
            errors.dob && touched.dob && (
              <span className="font-helper-text text-error mt-10">{errors.dob}</span>
            )
          }
        </div>
      </div>

      <div className='mt-80'>
        <button
          className={`button ${values["dob"] ? "active cursor-pointer" : "inactive cursor-default"}`}
          type={values["dob"] ? "submit" : "button"}
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
    dob: '',
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: (values, {props}) => {
    try {
      const dob = values["dob"];
      const {
        year,
        month,
        day
      } = dob;
      const dobStr = `${year}-${month.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}-${day.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}`;
      props.updateProfile({
        body: {
          dateOfBirth: dobStr,
        },
        nextPath: '/create-account/unit',
      })
    } catch (e) {
      console.log("storing values error", e);
    }
  }
})(FormBirth);

export default withTranslation()(EnhancedForm);