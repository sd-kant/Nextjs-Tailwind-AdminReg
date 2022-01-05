import React, {useMemo, useEffect, useState} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {bindActionCreators} from "redux";
import history from "../../../history";
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import {createCompany, updateCompany} from "../../../http";
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
    color: 'black',
    fontSize: '21px',
    lineHeight: '24.13px',
    zIndex: 1,
  }),
  control: styles => ({...styles, border: 'none', outline: 'none', boxShadow: 'none', zIndex: 1}),
  menu: styles => ({...styles,
    zIndex: 2,
    backgroundColor: 'white',
  }),
  input: styles => ({...styles, zIndex: 1,}),
  singleValue: (provided) => ({...provided, zIndex: 1,})
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
    editingCompanyName: Yup.string()
      .test(
        'is-valid',
        t('company name required'),
        function (value) {
          return this.parent.isEditing ? !!value : true;
        }
      )
      .min(6, t('company name min error'))
      .max(1024, t('company name max error')),
    companyLocation: Yup.object()
      .required(t('company location required')),
    twoFA: Yup.boolean(),
    passwordMinimumLength: Yup.number(),
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
    isOrgAdmin,
    isSuperAdmin,
  } = props;
  const options = useMemo(() => AVAILABLE_COUNTRIES, []);

  useEffect(() => {
    setRestBarClass("progress-0 medical");
    queryAllOrganizations();
  }, []);
  const [organizations, setOrganizations] = useState([]);
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

  useEffect(() => {
    setOrganizations((allOrganizations && allOrganizations.map(organization => ({
      value: organization.id,
      label: organization.name,
      location: organization.country,
      twoFA: organization.settings?.twoFA ?? false,
      passwordMinimumLength: organization.settings?.passwordMinimumLength ?? 6,
      passwordExpirationDays: organization.settings?.passwordExpirationDays ?? 0,
      created: true,
    }))) || []);
  }, [allOrganizations]);

  useEffect(() => {
    if (organizations?.length > 0 && isOrgAdmin) {
      changeHandler("companyName", organizations[0]);
    }
  }, [organizations, isOrgAdmin]);

  const cancelEditing = () => {
    setFieldValue("isEditing", false);
    setFieldValue("selectedItem", null);
  };

  const enableEditing = () => {
    setFieldValue("isEditing", true);
    setFieldValue("selectedItem", values.companyName?.value);
    setFieldValue('editingCompanyName', values.companyName?.label);
  };

  return (
    <Form className='form mt-57'>
      <div className={clsx(style.TopWrapper)}>
        <div className='grouped-form'>
          <label className="font-header-medium">
            {isSuperAdmin ? t("create or select company") : t("select company")}
          </label>
          {
            values.companyName?.created ?
              <label
                className={`font-binary d-block mt-8 text-capitalize text-orange cursor-pointer`}
                onClick={enableEditing}
              >
                {t("edit")}
              </label> :
              <label className={`font-binary d-block mt-8 text-capitalize text-white`}>
                {isSuperAdmin ? t("create or select company description") : t("select company description")}
              </label>
          }
        </div>

        <div className='d-flex flex-column mt-40'>
          <label className='font-input-label'>
            {t("company name")}
          </label>
          {
            values.isEditing ?
              <input
                className='input input-field mt-10 font-heading-small text-white'
                name="editingCompanyName"
                value={values["editingCompanyName"]}
                type='text'
                onChange={changeFormField}
              /> :
              (
                isSuperAdmin ?
                  <CreatableSelect
                    className='mt-10 font-heading-small text-black input-field'
                    isClearable
                    options={organizations}
                    value={values["companyName"]}
                    name="companyName"
                    styles={customStyles()}
                    placeholder={t("enter name")}
                    menuPortalTarget={document.body}
                    menuPosition={'fixed'}
                    onChange={(value) => changeHandler("companyName", value)}
                  /> :
                  <Select
                    className='mt-10 font-heading-small text-black input-field'
                    isClearable
                    options={organizations}
                    value={values["companyName"]}
                    name="companyName"
                    styles={customStyles()}
                    menuPortalTarget={document.body}
                    menuPosition={'fixed'}
                    placeholder={t("enter name")}
                    onChange={(value) => changeHandler("companyName", value)}
                  />
              )
          }
          {
            values["isEditing"] ?
              touched.editingCompanyName && errors.editingCompanyName && (
                <span className="font-helper-text text-error mt-10">{errors.editingCompanyName}</span>
              )
              :
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
            menuPortalTarget={document.body}
            menuPosition={'fixed'}
            placeholder={t("select")}
          />

          {
            touched.companyLocation && errors.companyLocation && (
              <span className="font-helper-text text-error mt-10">{errors.companyLocation}</span>
            )
          }
        </div>

        <div className='d-flex flex-column mt-40'>
          <label className='font-input-label'>
            {t("password min length")}
          </label>

          <div className='d-inline-block mt-10'>
            <ButtonGroup
              size={'sm'}
              rounded={true}
              disabled={!values.companyName?.__isNew__ && !values["isEditing"]}
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
              disabled={!values.companyName?.__isNew__ && !values["isEditing"]}
              options={passwordExpirationDaysOptions}
              value={values["passwordExpirationDays"]}
              id={'password-expiration-days-option'}
              setValue={(v) => changeHandler("passwordExpirationDays", v)}
            />
          </div>
        </div>

        <div className='d-flex flex-column mt-40'>
          <label className='font-input-label'>
            {t("2fa")}
          </label>

          <div className='d-inline-block mt-10'>
            <ButtonGroup
              options={twoFAOptions}
              disabled={!values.companyName?.__isNew__ && !values["isEditing"]}
              value={values["twoFA"]}
              id={'2fa-option'}
              setValue={(v) => changeHandler("twoFA", v)}
            />
          </div>
        </div>
      </div>

      <div className='mt-80'>
        <button
          className={`button ${values['companyName'] && values["companyLocation"] ? "active cursor-pointer" : "inactive cursor-default"}`}
          type={values['companyName'] && values["companyLocation"] ? "submit" : "button"}
        >
          <span className='font-button-label text-white text-uppercase'>
            {values["isEditing"] ? t("save") : t("next")}
          </span>
        </button>
        {
          values.isEditing &&
          <button
            className={`button cursor-pointer cancel ml-15`}
            type={"button"}
            onClick={cancelEditing}
          >
            <span className='font-button-label text-orange text-uppercase'>
              {t("cancel")}
            </span>
          </button>
        }
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
  handleSubmit: async (values, {props, setFieldValue}) => {
    const data = {
      name: values.isEditing ? values?.editingCompanyName : values?.companyName?.label,
      country: values?.companyLocation?.label,
      settings: {
        twoFA: values.twoFA,
        passwordMinimumLength: values.passwordMinimumLength,
        passwordExpirationDays: values.passwordExpirationDays,
      },
    };

    if (values.isEditing) {
      if (values.selectedItem) {
        // todo update company, and cancel editing
        try {
          props.setLoading(true);
          await updateCompany(values.selectedItem, data);
          setFieldValue("isEditing", false);
          setFieldValue("selectedItem", null);
          props.queryAllOrganizations();
        } catch (e) {
          console.log("update company error", e);
          props.showErrorNotification(e.response?.data?.message ?? props.t("msg something went wrong"));
        } finally {
          props.setLoading(false);
        }
      }
    } else {
      if (values?.companyName?.created) { // if selected already created company
        localStorage.setItem("kop-v2-picked-organization-id", values?.companyName?.value);
        history.push("/invite/team-mode");
      } else {
        try {
          props.setLoading(true);
          const apiRes = await createCompany(data);
          const companyData = apiRes.data;
          localStorage.setItem("kop-v2-picked-organization-id", companyData?.id);
          history.push("/invite/representative");
          // history.push("/invite/team-mode");
        } catch (e) {
          console.log("creating company error", e);
          props.showErrorNotification(e.response?.data?.message ?? props.t("msg something went wrong"));
        } finally {
          props.setLoading(false);
        }
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