import React, {useMemo, useEffect, useState} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {bindActionCreators} from "redux";
import CreatableSelect from 'react-select/creatable';
import {createCompany, createUserByAdmin, getUsersUnderOrganization, updateCompany} from "../../../http";
import {
  setLoadingAction,
  setRestBarClassAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from "../../../redux/action/ui";
import {
  passwordExpirationDaysOptions,
  passwordMinLengthOptions,
  twoFAOptions, USER_TYPE_ORG_ADMIN
} from "../../../constant";
import {queryAllOrganizationsAction} from "../../../redux/action/base";
import {get} from "lodash";
import ButtonGroup from "../../components/ButtonGroup";
import clsx from "clsx";
import style from "./FormCompany.module.scss";
import ResponsiveSelect from "../../components/ResponsiveSelect";
import MultiSelectPopup from "../../components/MultiSelectPopup";
import countryRegions from 'country-region-data/data.json';
import removeIcon from "../../../assets/images/remove.svg";
import plusCircleFire from "../../../assets/images/plus-circle-fire.svg";
import {defaultMember, lowercaseEmail, setUserTypeToUsers} from "./FormRepresentative";
import {useNavigate} from "react-router-dom";

export const customStyles = () => ({
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#DE7D2C' : (state.isFocused ? '#5BAEB6' : 'white'),
    color: 'black',
    fontSize: '21px',
    lineHeight: '24.13px',
    zIndex: 1,
  }),
  control: styles => ({...styles, border: 'none', outline: 'none', boxShadow: 'none', zIndex: 1}),
  menu: styles => ({
    ...styles,
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
    companyCountry: Yup.object()
      .required(t('company country required')),
    regions: Yup.array().required(t('company region required')),
    twoFA: Yup.boolean(),
    passwordMinimumLength: Yup.number(),
    passwordExpirationDays: Yup.number(),
    users: Yup.array().of(
      Yup.object().shape({
        email: Yup.string()
          .required(t('email required'))
          .email(t("email invalid"))
          .max(1024, t('email max error')),
        firstName: Yup.string()
          .required(t('firstName required'))
          .max(1024, t("firstName max error")),
        lastName: Yup.string()
          .required(t('lastName required'))
          .max(1024, t("lastName max error")),
      }).required(),
    ),
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
  // const options = useMemo(() => AVAILABLE_COUNTRIES, []);
  const options = useMemo(() =>
      countryRegions?.map(it => ({label: it.countryName, value: it.countryShortCode})),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [countryRegions]
  );
  const [orgAdmins, setOrgAdmins] = React.useState([]);
  const navigate = useNavigate();
  React.useEffect(() => {
    setFieldValue("users", []);
    if (!(values.companyName?.__isNew__) && values.companyName?.value) {
      fetchOrgAdmins(values.companyName?.value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.companyName?.value, values.isEditing]);
  const fetchOrgAdmins = organizationId => {
    getUsersUnderOrganization({
      organizationId,
      userType: 'OrgAdmin',
    })
      .then(res => {
        setOrgAdmins(res.data ?? []);
      })
      .catch(e => {
        console.error("get org admin error", e);
      });
  }
  useEffect(() => {
    setRestBarClass("progress-0 medical");
    queryAllOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [organizations, setOrganizations] = useState([]);
  const changeFormField = (e) => {
    const {value, name} = e.target;
    setFieldValue(name, value);
  }
  const deleteMember = (index) => {
    const data = JSON.parse(JSON.stringify(values["users"]));
    data.splice(index, 1);
    setFieldValue("users", data);
  }
  const addAnother = () => {
    const data = JSON.parse(JSON.stringify(values["users"]));
    data.push(defaultMember);
    setFieldValue("users", data);
  }
  const changeHandler = (key, value) => {
    if (key === "companyName") {
      if (value && value.created) { // if already created company, then set country according to picked company
        const country = options?.find(entity => entity.label === value.country);
        if (country) {
          setFieldValue("companyCountry", country);
        } else {
          setFieldValue("companyCountry", options?.[0]);
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
      country: organization.country,
      regions: organization.regions,
      twoFA: organization.settings?.twoFA ?? false,
      passwordMinimumLength: organization.settings?.passwordMinimumLength ?? 6,
      passwordExpirationDays: organization.settings?.passwordExpirationDays ?? 0,
      created: true,
    }))) || []);
  }, [allOrganizations]);

  useEffect(() => {
    if (organizations?.length > 0 && values["companyName"]?.value) {
      changeHandler("companyName", organizations.find(it => it.value?.toString() === values["companyName"]?.value?.toString()));
    } else if (isOrgAdmin) {
      changeHandler("companyName", organizations[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const isEditing = useMemo(() => values.companyName?.__isNew__ || values["isEditing"], [values]);
  const regionsInCountry = useMemo(() => countryRegions?.find(it => it.countryShortCode === values.companyCountry?.value)?.regions ?? [], [values.companyCountry]);
  const formattedRegions = useMemo(() =>
    regionsInCountry?.map(it => ({
      value: it.shortCode,
      label: it.name,
    })), [regionsInCountry]);
  const regionSelectorLabel = React.useMemo(() => {
    if (values?.regions?.length > 0) {
      if (formattedRegions?.length > 1 && (values?.regions?.length === formattedRegions?.length)) {
        return t("all regions");
      } else if (values?.regions?.length > 1) {
        return t("n regions selected", {n: values?.regions.length});
      } else {
        return formattedRegions?.find(it => it.label === values?.regions?.[0]?.label)?.label;
      }
    } else {
      return t("select region");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.regions, formattedRegions]);
  useEffect(() => {
    if (values.companyName?.__isNew__) {
      setFieldValue("regions", []);
    } else {
      const organization = organizations?.find(it => it.value?.toString() === values.companyName?.value?.toString());
      setFieldValue("regions", formattedRegions?.filter(it => organization?.regions.some(ele => ele === it.label)) ?? []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedRegions, values.companyName]);

  const handleCancel = () => {
    if (isEditing) {
      cancelEditing();
    } else {
      navigate("/select-mode");
    }
  };

  return (
    <Form className='form mt-57'>
      <div className={clsx(style.TopWrapper)}>
        <div className='grouped-form'>
          <label className="font-header-medium">
            {values.isEditing ? t("edit company") : (isSuperAdmin ? t("create or select company") : t("welcome"))}
          </label>
          {
            (values.companyName?.created && !values.isEditing) ?
              <label
                className={`font-binary d-block mt-8 text-capitalize text-orange cursor-pointer`}
                onClick={enableEditing}
              >
                {t("edit")}
              </label> : null
            /*<label className={`font-binary d-block mt-8 text-capitalize text-white`}>
              {isSuperAdmin ? t("create or select company description") : t("select company description")}
            </label>*/
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
                  <ResponsiveSelect
                    className='mt-10 font-heading-small text-black input-field'
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
        {
          isEditing &&
          <div className='mt-40 d-flex flex-column'>
            <label className='font-input-label'>
              {t("company country")}
            </label>

            <ResponsiveSelect
              className='mt-10 font-heading-small text-black input-field'
              options={options}
              value={values["companyCountry"]}
              name="companyCountry"
              styles={customStyles()}
              onChange={(value) => changeHandler("companyCountry", value)}
              menuPortalTarget={document.body}
              menuPosition={'fixed'}
              placeholder={t("select")}
            />

            {
              touched.companyCountry && errors.companyCountry && (
                <span className="font-helper-text text-error mt-10">{errors.companyCountry}</span>
              )
            }
          </div>
        }
        {
          (isEditing && values["companyCountry"]?.value) &&
          <div className='mt-40 d-flex flex-column'>
            <span className='font-input-label'>
              {t("company region")}
            </span>

            <div className='mt-10 input-field'>
              <MultiSelectPopup
                label={regionSelectorLabel}
                options={formattedRegions}
                value={values["regions"]}
                onChange={value => changeHandler('regions', value)}
              />
            </div>
            {
              touched.regions && errors.regions && (
                <span className="font-helper-text text-error mt-10">{errors.regions}</span>
              )
            }
          </div>
        }

        {
          values.isEditing &&
          <React.Fragment>
            <div className='grouped-form mt-40'>
              <label className="font-header-medium">
                {t("company administrators")}
              </label>
            </div>
            <div className='grouped-form mt-25'
                 style={{maxWidth: '700px', overFlowY: 'auto'}}>
              {
                orgAdmins?.map((user, index) => (
                  <div
                    className={`team-representative-wrapper d-flex ${index !== 0 ? "mt-25" : ""}`}
                    key={`already-registered-member-${index}`}
                  >
                    <div className="d-flex flex-column">
                      {
                        index === 0 &&
                        <label className="font-input-label text-white">
                          {t("firstName")}
                        </label>
                      }

                      <input
                        className={clsx(style.DisabledInput, "input font-binary text-white mt-10 px-15")}
                        defaultValue={user?.firstName}
                        disabled
                        type="text"
                        style={{width: "145px"}}
                      />
                    </div>

                    <div className="d-flex flex-column ml-25">
                      {
                        index === 0 &&
                        <label className="font-input-label text-white">
                          {t("lastName")}
                        </label>
                      }

                      <input
                        className={clsx(style.DisabledInput, "input font-binary text-white mt-10 px-15")}
                        defaultValue={user?.lastName}
                        disabled
                        type="text"
                        style={{width: "145px"}}
                      />
                    </div>

                    <div className="d-flex flex-column ml-25">
                      {
                        index === 0 &&
                        <label className="font-input-label text-white">
                          {t("administrator email")}
                        </label>
                      }

                      <input
                        className={clsx(style.DisabledInput, "input font-binary text-white mt-10 px-15")}
                        defaultValue={user?.email}
                        disabled
                        type="text"
                        style={{width: "195px"}}
                      />
                    </div>
                  </div>
                ))
              }
              {
                values && values["users"] && values["users"].map((user, index) => {
                  return (
                    <div
                      className={`team-representative-wrapper d-flex ${orgAdmins.length !== 0 || index !== 0 ? "mt-25" : ""}`}
                      key={`member-${index}`}
                    >
                      <div className="d-flex flex-column">
                        {
                          (orgAdmins?.length === 0 && index === 0) &&
                          <label className="font-input-label text-white">
                            {t("firstName")}
                          </label>
                        }

                        <input
                          className="input font-binary text-white mt-10 px-15"
                          name={`users[${index}].firstName`}
                          value={values?.users && values.users[index] && values.users[index]?.firstName}
                          type="text"
                          style={{width: "145px"}}
                          onChange={changeFormField}
                        />

                        {
                          touched?.users && touched.users[index] && touched.users[index]?.firstName &&
                          errors?.users && errors.users[index] && errors.users[index]?.firstName && (
                            <span className="font-helper-text text-error mt-10">{errors.users[index].firstName}</span>
                          )
                        }
                      </div>

                      <div className="d-flex flex-column ml-25">
                        {
                          (orgAdmins?.length === 0 && index === 0) &&
                          <label className="font-input-label text-white">
                            {t("lastName")}
                          </label>
                        }

                        <input
                          className="input font-binary text-white mt-10 px-15"
                          name={`users[${index}].lastName`}
                          value={values?.users && values.users[index] && values.users[index]?.lastName}
                          type="text"
                          style={{width: "145px"}}
                          onChange={changeFormField}
                        />

                        {
                          touched?.users && touched.users[index] && touched.users[index]?.lastName &&
                          errors?.users && errors.users[index] && errors.users[index]?.lastName && (
                            <span className="font-helper-text text-error mt-10">{errors.users[index].lastName}</span>
                          )
                        }
                      </div>

                      <div className="d-flex flex-column ml-25">
                        {
                          (orgAdmins?.length === 0 && index === 0) &&
                          <label className="font-input-label text-white">
                            {t("administrator email")}
                          </label>
                        }

                        <input
                          className="input font-binary text-white mt-10 px-15"
                          name={`users[${index}].email`}
                          value={values?.users && values.users[index] && values.users[index]?.email}
                          type="text"
                          style={{width: "195px"}}
                          onChange={changeFormField}
                        />

                        {
                          touched?.users && touched.users[index] && touched.users[index]?.email &&
                          errors?.users && errors.users[index] && errors.users[index]?.email && (
                            <span className="font-helper-text text-error mt-10">{errors.users[index].email}</span>
                          )
                        }
                      </div>

                      <div className="d-flex align-center ml-25" style={{height: '45px'}}>
                        <img
                          className={`${(orgAdmins?.length === 0 && index === 0) ? 'mt-57' : 'mt-25'} cursor-pointer`}
                          style={{zIndex: 1}}
                          src={removeIcon}
                          width={30}
                          height={30}
                          alt="close icon"
                          onClick={() => deleteMember(index)}
                        />
                      </div>
                    </div>
                  )
                })
              }
            </div>

            <div className={`d-flex align-center mt-15 mb-15`} style={{zIndex: 1, position: "relative"}}>
              <img
                src={plusCircleFire} className="cursor-pointer"
                onClick={addAnother}
                alt="add icon"
              />
              <span
                className="font-binary cursor-pointer"
                onClick={addAnother}
              >
                &nbsp;&nbsp;{values.users?.length > 0 || orgAdmins?.length > 0 ? t("add another company admin") : t("add company admin")}
              </span>
            </div>
          </React.Fragment>
        }

        {
          isEditing &&
          <React.Fragment>
            <div className='grouped-form mt-40'>
              <label className="font-header-medium">
                {t("security")}
              </label>
            </div>

            <div className='d-flex flex-column mt-25'>
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

            <div className='d-flex flex-column mt-25'>
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

            <div className='d-flex flex-column mt-25'>
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
          </React.Fragment>
        }
      </div>

      <div className='mt-80'>
        <button
          className={"button active cursor-pointer"}
          type={"submit"}
        >
          <span className='font-button-label text-white text-uppercase'>
            {values["isEditing"] ? t("save") : t("next")}
          </span>
        </button>
        <button
          className={clsx(style.CancelBtn, `button cursor-pointer cancel`)}
          type={"button"}
          onClick={handleCancel}
        >
            <span className='font-button-label text-orange text-uppercase'>
              {t("cancel")}
            </span>
        </button>
      </div>
    </Form>
  )
}

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    companyName: '',
    companyCountry: '',
    regions: [],
    twoFA: false,
    passwordMinimumLength: 6,
    passwordExpirationDays: 0,
    users: [],
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props, setFieldValue}) => {
    const {isSuperAdmin, navigate} = props;
    const data = {
      name: values.isEditing ? values?.editingCompanyName : values?.companyName?.label,
      country: values?.companyCountry?.label,
      regions: values?.regions?.map(it => it.label) ?? [],
      settings: {
        twoFA: values.twoFA,
        passwordMinimumLength: values.passwordMinimumLength,
        passwordExpirationDays: values.passwordExpirationDays,
      },
    };

    if (values.isEditing) {
      if (values.selectedItem) {
        try {
          props.setLoading(true);
          const organizationId = values.selectedItem;
          await updateCompany(organizationId, data);

          // creating org admins
          let users = values?.users;
          users = setUserTypeToUsers(lowercaseEmail(users), USER_TYPE_ORG_ADMIN);
          const promises = [];
          let totalSuccessForInvite = 0;

          users?.forEach(it => {
            promises.push(createUserByAdmin(organizationId, it));
          });
          if (promises?.length > 0) {
            Promise.allSettled(promises)
              .then(items => {
                items.forEach((item, index) => {
                  if (item.status === "fulfilled") {
                    totalSuccessForInvite++;
                  } else {
                    console.error("creating user failed", item.reason?.response?.data);
                    if (item?.reason?.response?.data?.status?.toString() === "409") {
                      props.showErrorNotification(props.t(
                        'msg user email conflicts', {
                          email: users[index]?.email,
                        }));
                    }
                  }
                });
              })
              .finally(() => {
                if (totalSuccessForInvite > 0) {
                  props.showSuccessNotification(props.t(
                    totalSuccessForInvite ?
                      'msg users created success' : 'msg user created success', {
                      numberOfSuccess: totalSuccessForInvite,
                    }));
                }
              });
          }

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
        navigate(`/invite/${values?.companyName?.value}/team-mode`);
      } else {
        try {
          props.setLoading(true);
          const apiRes = await createCompany(data);
          const companyData = apiRes.data;
          isSuperAdmin ? navigate(`/invite/${companyData?.id}/representative`) : navigate(`/invite/${companyData?.id}/team-mode`);
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
      showSuccessNotification: showSuccessNotificationAction,
      queryAllOrganizations: queryAllOrganizationsAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));