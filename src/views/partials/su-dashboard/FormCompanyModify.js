import React, {useMemo, useEffect} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {bindActionCreators} from "redux";
import history from "../../../history";
import Select from 'react-select';
import {getCompany} from "../../../http";
import {setLoadingAction, setRestBarClassAction, showErrorNotificationAction} from "../../../redux/action/ui";
import {AVAILABLE_COUNTRIES} from "../../../constant";
import {get} from "lodash";
import Toggle from "../../components/Toggle";

export const customStyles = (disabled = false) => ({
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#DE7D2C' : 'white',
    zIndex: 1,
  }),
  control: styles => ({...styles, border: 'none', outline: 'none', boxShadow: 'none', zIndex: 1}),
  menu: styles => ({...styles, zIndex: 2}),
  input: styles => ({...styles,zIndex: 1,}),
  singleValue: (provided) => ({...provided,zIndex: 1,})
});

const formSchema = (t) => {
  return Yup.object().shape({
    companyName: Yup.string()
      .required(t('company name required'))
      .min(6, t('company name min error'))
      .max(1024, t('company name max error')),
    companyLocation: Yup.object()
      .required(t('company location required')),
    twoFA: Yup.boolean(),
  });
};

const FormCompanyModify = (props) => {
  const {
    values,
    errors,
    touched,
    t,
    setFieldValue,
    setRestBarClass,
    match,
    setLoading,
    showErrorNotification,
  } = props;
  const options = useMemo(() => AVAILABLE_COUNTRIES, []);

  useEffect(() => {
    setRestBarClass("progress-0 medical");
    if (match?.params?.id) {
      setLoading(true);
      getCompany(match.params.id)
        .then(response => {
          const {name, country} = response.data;
          setFieldValue("companyName", name);
          const countryItem = AVAILABLE_COUNTRIES.find(it => it.label === country);
          setFieldValue("companyLocation", countryItem);
        })
        .catch(e => {
          console.log("get company error", e);
          showErrorNotification(e.response?.data?.message || t("msg something went wrong"));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  const changeFormField = (e) => {
    const {value, name} = e.target;
    setFieldValue(name, value);
  }

  const changeHandler = (key, value) => {
    setFieldValue(key, value);
  }

  return (
    <Form className='form mt-57'>
      <div>
        <div className='grouped-form'>
          <label className="font-header-medium">
            {/*// todo add to translation*/}
            {t("modify company")}
          </label>

          <label className="font-binary d-block mt-8">
            {/*// todo add to translation*/}
            {t("modify company description")}
          </label>
        </div>

        <div className='d-flex flex-column mt-40'>
          <label className='font-input-label'>
            {t("company name")}
          </label>

          <input
            className='input input-field mt-10 font-heading-small text-white'
            name="companyName"
            value={values["companyName"]}
            type='text'
            onChange={changeFormField}
          />
          {
            touched.companyName && errors.companyName && (
              <span className="font-helper-text text-error mt-10">{errors.companyName}</span>
            )
          }
        </div>

        <div className='mt-40 d-flex flex-column'>
          <label className='font-input-label'>
            {t("country")}
          </label>

          <Select
            className='mt-10 font-heading-small text-black input-field'
            options={options}
            value={values["companyLocation"]}
            name="companyLocation"
            styles={customStyles()}
            onChange={(value) => changeHandler("companyLocation", value)}
            placeholder={t("select")}
          />

          {
            touched.companyLocation && errors.companyLocation && (
              <span className="font-helper-text text-error mt-10">{errors.companyLocation}</span>
            )
          }
        </div>
        {/*todo add translations*/}
        <div className='d-flex flex-column mt-40'>
          <label className='font-input-label'>
            {t("enable 2fa")}
          </label>

          <div className='d-inline-block mt-10'>
            <Toggle
              on={values["twoFA"]}
              titleOn={t('off')}
              titleOff={t('on')}
              handleSwitch={(v) => {
                changeHandler("twoFA", v);
              }}
          />
          </div>
        </div>
      </div>

      <div className='mt-80'>
        <button
          className={`button ${values['companyName'] && values["companyLocation"] ? "active cursor-pointer" : "inactive cursor-default"}`}
          type={values['companyName'] && values["companyLocation"] ? "submit" : "button"}
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
    companyName: '',
    companyLocation: '',
    twoFA: false,
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props}) => {

  }
})(FormCompanyModify);

const mapStateToProps = (state) => ({
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      setRestBarClass: setRestBarClassAction,
      showErrorNotification: showErrorNotificationAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));