import React, {useMemo, useEffect} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {bindActionCreators} from "redux";
import history from "../../../history";
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import {createCompany} from "../../../http";
import {setLoadingAction, setRestBarClassAction, showErrorNotificationAction} from "../../../redux/action/ui";
import {
  AVAILABLE_COUNTRIES,
  passwordExpirationDaysOptions,
  passwordMinLengthOptions,
  twoFAOptions
} from "../../../constant";
import {queryAllOrganizationsAction} from "../../../redux/action/base";
import {get} from "lodash";
import ButtonGroup from "../../components/ButtonGroup";
import clsx from "clsx";
import style from "./FormCompany.module.scss";

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
    companyName: Yup.object()
      .shape({
        label: Yup.string()
          .required(t('company name required'))
          .min(6, t('company name min error'))
          .max(1024, t('company name max error')),
      })
      .nullable()
      .required(t('company name required')),
    companyLocation: Yup.object()
      .required(t('company location required')),
    twoFA: Yup.boolean(),
    passwordMinimumLength: Yup.number().required(),
    passwordExpirationDays: Yup.number(),
  });
};

const FormCompany = (props) => {
  const {
    values,
    errors,
    touched,
    t,
    allOrganizations,
    setFieldValue,
    setRestBarClass,
    queryAllOrganizations,
  } = props;
  const options = useMemo(() => AVAILABLE_COUNTRIES, []);

  useEffect(() => {
    setRestBarClass("progress-0 medical");
    queryAllOrganizations();
  }, []);

  const changeFormField = (e) => {
    const {value, name} = e.target;
    setFieldValue(name, value);
  }

  const changeHandler = (key, value) => {
    if (key === "companyName") {
      if (value && value.created) { // if already created company, then set location according to picked company
        const location = AVAILABLE_COUNTRIES.find(entity => entity.label === value.location);
        if (location) {
          setFieldValue("companyLocation", location);
        } else {
          setFieldValue("companyLocation", AVAILABLE_COUNTRIES && AVAILABLE_COUNTRIES[0]);
        }
        const fields = ["twoFA", 'passwordMinimumLength', 'passwordExpirationDays'];
        fields?.forEach(item => setFieldValue(item, value[item]))
      }
    }
    setFieldValue(key, value);
  }

  const organizations = useMemo(() => {
    return (allOrganizations && allOrganizations.map(organization => ({
      value: organization.id,
      label: organization.name,
      location: organization.country,
      twoFA: organization.settings?.twoFA ?? false,
      passwordMinimumLength: organization.settings?.passwordMinimumLength ?? 6,
      passwordExpirationDays: organization.settings?.passwordExpirationDays ?? 0,
      created: true,
    }))) || [];
  }, [allOrganizations]);

  return (
    <Form className='form mt-57'>
      <div className={clsx(style.TopWrapper)}>
        <div className='grouped-form'>
          <label className="font-header-medium">
            {t("create or select company")}
          </label>

          <label className={`font-binary d-block mt-8 text-capitalize ${values.companyName?.created ? 'text-orange' : 'text-white'}`}>
            {values.companyName?.created ? t("edit"): t("create or select company description")}
          </label>
        </div>

        <div className='d-flex flex-column mt-40'>
          <label className='font-input-label'>
            {t("company name")}
          </label>

          {/*<input
            className='input input-field mt-10 font-heading-small text-white'
            name="companyName"
            value={values["companyName"]}
            type='text'
            onChange={changeFormField}
          />*/}
          <CreatableSelect
            className='mt-10 font-heading-small text-black input-field'
            isClearable
            options={organizations}
            value={values["companyName"]}
            name="companyName"
            styles={customStyles()}
            placeholder={t("enter name")}
            onChange={(value) => changeHandler("companyName", value)}
          />

          {
            touched.companyName && errors.companyName && (
              <span className="font-helper-text text-error mt-10">{errors.companyName?.label}</span>
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
            {t("2fa")}
          </label>

          <div className='d-inline-block mt-10'>
            <ButtonGroup
              options={twoFAOptions}
              value={values["twoFA"]}
              id={'2fa-option'}
              setValue={(v) => changeHandler("twoFA", v)}
            />
          </div>
        </div>

        <div className='d-flex flex-column mt-40'>
          <label className='font-input-label'>
            {t("password min length")}
          </label>

          <div className='d-inline-block mt-10'>
            <ButtonGroup
              size={'sm'}
              rounded={true}
              options={passwordMinLengthOptions}
              value={values["passwordMinimumLength"]}
              id={'password-min-length-option'}
              setValue={(v) => changeHandler("passwordMinimumLength", v)}
            />
          </div>
        </div>

        <div className='d-flex flex-column mt-40'>
          <label className='font-input-label'>
            {t("Password Expiration (Days)")}
          </label>

          <div className='d-inline-block mt-10'>
            <ButtonGroup
              size={'sm'}
              rounded={true}
              options={passwordExpirationDaysOptions}
              value={values["passwordExpirationDays"]}
              id={'password-expiration-days-option'}
              setValue={(v) => changeHandler("passwordExpirationDays", v)}
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
    passwordMinimumLength: 6,
    passwordExpirationDays: 0,
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props}) => {
    if (values?.companyName?.created) { // if selected already created company
      localStorage.setItem("kop-v2-picked-organization-id", values?.companyName?.value);
      // fixme redirect to organization modify page
      history.push("/invite/team-mode");
    } else {
      console.log("values", values);
      return;
      const data = {
        name: values?.companyName?.label,
        country: values?.companyLocation?.label,
      };

      try {
        props.setLoading(true);
        const apiRes = await createCompany(data);
        const companyData = apiRes.data;
        localStorage.setItem("kop-v2-picked-organization-id", companyData?.id);
        history.push("/invite/representative");
        // history.push("/invite/team-mode");
      } catch (e) {
        console.log("creating company error", e);
        props.showErrorNotification(props.t("msg something went wrong"));
      } finally {
        props.setLoading(false);
      }
    }
  }
})(FormCompany);

const mapStateToProps = (state) => ({
  allOrganizations: get(state, 'base.allOrganizations'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      setRestBarClass: setRestBarClassAction,
      showErrorNotification: showErrorNotificationAction,
      queryAllOrganizations: queryAllOrganizationsAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));