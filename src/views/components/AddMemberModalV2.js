import React, {useMemo, useEffect} from "react";
import Modal from "react-modal";
import Select from "react-select";
import {connect} from "react-redux";
import {get} from "lodash";
import clsx from "clsx";
import style from "./AddMemberModalV2.module.scss";
import {customStyles} from "../partials/su-dashboard/FormInvite";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import removeIcon from "../../assets/images/remove.svg";
import {USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN} from "../../constant";
import CustomPhoneInput from "./PhoneInput";
import {checkPhoneNumberValidation} from "../../utils";

const userSchema = (t) => {
  return Yup.object().shape({
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
    permissionLevel: Yup.object()
      .required(t('role required')),
    jobRole: Yup.object()
      .required(t('role required')),
    phoneNumber: Yup.object()
      .required(t('phone number required'))
      .test(
        'is-valid',
        t('phone number invalid'),
        function (obj) {
          return checkPhoneNumberValidation(obj.value, obj.countryCode);
        },
      ),
  }).required();
};

const userSchemaForInvite = (t) => {
  return Yup.object().shape({
    email: Yup.string()
      .required(t('email required'))
      .email(t("email invalid"))
      .max(1024, t('email max error')),
    permissionLevel: Yup.object()
      .required(t('role required')),
  }).required();
};

const formSchema = (t) => {
  return Yup.object().shape({
    user: userSchema(t),
  });
};

const formSchemaForInvite = (t) => {
  return Yup.object().shape({
    user: userSchemaForInvite(t),
  });
};

const AddMemberModalV2 = (
  {
    t,
    isOpen = false,
    onClose,
    permissionLevels,
    sortedJobs,
    setFieldValue,
    values,
    resetForm,
    errors,
    touched,
    inviteOnly,
    userType,
  }) => {
  const {user} = values;
  const isAdmin = userType?.includes(USER_TYPE_ADMIN) || userType?.includes(USER_TYPE_ORG_ADMIN);
  const options = useMemo(() => {
    if (isAdmin) {
      return permissionLevels;
    } else {
      return permissionLevels.filter(it => it.value?.toString() !== "1");
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isOpen) {
      resetForm({
        values: {
          user: defaultUser,
        },
      });
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      className={clsx(style.Modal)}
      overlayClassName={clsx(style.ModalOverlay)}
      appElement={document.getElementsByTagName("body")}
    >
      <Form>
        <div className={clsx(style.Wrapper)}>
          <div
            className={clsx(style.RemoveIconWrapper)}
            onClick={onClose}
          >
            <img
              src={removeIcon}
              alt="remove icon"
            />
          </div>

          <div className={clsx(style.Header)}>
            {
              inviteOnly ?
                <span className={'font-modal-header text-white'}>
                  {t('enter team member email')}
                </span> :
                <>
                  <span className={'font-modal-header text-white'}>
                    {t('notice')}
                  </span>
                  <br/>
                  <span className={'font-modal-header text-white'}>
                    {t('team member not registered')}
                  </span>
                  <br/>
                  <span className={'font-modal-header text-white'}>
                    {t('enter new team member information')}
                  </span>
                </>
            }
          </div>
          {
            inviteOnly ?
              <div className={clsx(style.User)}>
                <div className={clsx(style.UserRow)}>
                  <div className="d-flex flex-column">
                    <label className='font-input-label'>
                      {t("email")}
                    </label>

                    <input
                      className={clsx(style.Input, 'input mt-10 font-heading-small text-white')}
                      name='user.email'
                      value={user?.email}
                      onChange={(e) => setFieldValue('user.email', e.target.value)}
                      type="email"
                    />

                    {
                      touched?.user && touched.user?.email &&
                      errors?.user && errors.user?.email && (
                        <span className="font-helper-text text-error mt-10">{errors.user.email}</span>
                      )
                    }
                  </div>
                  <div className={clsx("d-flex flex-column")}>
                    <label className="font-input-label text-white text-capitalize">
                      {t("permission level")}
                    </label>

                    <Select
                      className={clsx(style.FullWidthSelect, 'mt-10 font-heading-small text-black select-custom-class')}
                      placeholder={t("select")}
                      styles={customStyles()}
                      options={options}
                      // options={permissionLevels}
                      value={user?.permissionLevel}
                      name={'user.permissionLevel'}
                      onChange={(e) => setFieldValue('user.permissionLevel', e)}
                    />

                    {
                      touched?.user && touched.user?.permissionLevel &&
                      errors?.user && errors.user?.permissionLevel && (
                        <span className="font-helper-text text-error mt-10">{errors.user.permissionLevel}</span>
                      )
                    }
                  </div>
                </div>
              </div>
              :
              <div className={clsx(style.User)}>
                <div className={clsx(style.UserRow)}>
                  <div className="d-flex flex-column">
                    <label className='font-input-label'>
                      {t("firstName")}
                    </label>

                    <input
                      className={clsx(style.Input, 'input mt-10 font-heading-small text-white')}
                      name='user.firstName'
                      value={user?.firstName ?? ""}
                      onChange={(e) => setFieldValue('user.firstName', e.target.value)}
                      type="text"
                    />

                    {
                      touched?.user && touched.user?.firstName &&
                      errors?.user && errors.user?.firstName && (
                        <span className="font-helper-text text-error mt-10">{errors.user.firstName}</span>
                      )
                    }
                  </div>

                  <div className="d-flex flex-column">
                    <label className='font-input-label'>
                      {t("lastName")}
                    </label>

                    <input
                      className={clsx(style.Input, 'input mt-10 font-heading-small text-white')}
                      name='user.lastName'
                      value={user?.lastName ?? ""}
                      onChange={(e) => setFieldValue('user.lastName', e.target.value)}
                      type="text"
                    />

                    {
                      touched?.user && touched.user?.lastName &&
                      errors?.user && errors.user?.lastName && (
                        <span className="font-helper-text text-error mt-10">{errors.user.lastName}</span>
                      )
                    }
                  </div>
                </div>

                <div className={clsx(style.UserRow)}>
                  <div className="d-flex flex-column">
                    <label className='font-input-label'>
                      {t("email")}
                    </label>

                    <input
                      className={clsx(style.Input, 'input mt-10 font-heading-small text-white')}
                      name='user.email'
                      value={user?.email ?? ""}
                      onChange={(e) => setFieldValue('user.email', e.target.value)}
                      type="email"
                    />

                    {
                      touched?.user && touched.user?.email &&
                      errors?.user && errors.user?.email && (
                        <span className="font-helper-text text-error mt-10">{errors.user.email}</span>
                      )
                    }
                  </div>

                  <div className={clsx(style.SelectWrapper, "d-flex")}>
                    <div className="d-flex flex-column">
                      <label className="font-input-label text-white text-capitalize">
                        {t("job")}
                      </label>

                      <Select
                        className='mt-10 font-heading-small text-black select-custom-class'
                        placeholder={t("select")}
                        styles={customStyles()}
                        options={sortedJobs}
                        maxMenuHeight={190}
                        value={user.jobRole}
                        name={'user.jobRole'}
                        onChange={(e) => {
                          setFieldValue('user.jobRole', e)
                        }}
                      />

                      {
                        touched?.user && touched.user?.jobRole &&
                        errors?.user && errors.user?.jobRole && (
                          <span className="font-helper-text text-error mt-10">{errors.user.jobRole}</span>
                        )
                      }
                    </div>

                    <div className={clsx("d-flex flex-column")}>
                      <label className="font-input-label text-white text-capitalize">
                        {t("permission level")}
                      </label>

                      <Select
                        className='mt-10 font-heading-small text-black select-custom-class'
                        placeholder={t("select")}
                        styles={customStyles()}
                        options={options}
                        // options={permissionLevels}
                        value={user.permissionLevel}
                        name={'user.permissionLevel'}
                        onChange={(e) => setFieldValue('user.permissionLevel', e)}
                      />

                      {
                        touched?.user && touched.user?.permissionLevel &&
                        errors?.user && errors.user?.permissionLevel && (
                          <span className="font-helper-text text-error mt-10">{errors.user.permissionLevel}</span>
                        )
                      }
                    </div>
                  </div>
                </div>

                <div className={clsx(style.UserRow)}>
                  <div>
                    <label className='font-input-label'>
                      {t("phone number")}
                    </label>
                    <CustomPhoneInput
                      containerClass={style.PhoneNumberContainer}
                      inputClass={style.PhoneNumberInput}
                      dropdownClass={style.PhoneNumberDropdown}
                      value={user.phoneNumber.value}
                      onChange={(value, countryCode) => setFieldValue('user.phoneNumber', {value, countryCode})}
                    />
                    {
                      (touched?.user && touched.user?.phoneNumber &&
                      errors?.user && errors.user?.phoneNumber) ? (
                        <span className="font-helper-text text-error mt-10">{errors.user.phoneNumber}</span>
                      ) : (<span className="font-helper-text text-white mt-10">{t("required for 2fa")}</span>)
                    }
                  </div>

                  <div>

                  </div>
                </div>
              </div>
          }
          <div className={clsx(style.Footer)}>
            <button
              className={`button active cursor-pointer`}
              type={"submit"}
            >
              <span className='font-button-label text-white text-uppercase'>
                {inviteOnly ? t("add team member") : t("invite team member")}
              </span>
            </button>
          </div>
        </div>
      </Form>
    </Modal>
  )
}

const defaultUser = {
  email: '',
  firstName: '',
  lastName: '',
  permissionLevel: '',
  jobRole: "",
  phoneNumber: {
    value: '',
    countryCode: '',
  },
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({user: defaultUser}),
  validationSchema: ((props) => props.inviteOnly ? formSchemaForInvite(props.t) : formSchema(props.t)),
  enableReinitialize: true,
  handleSubmit: async (values, {props}) => {
    props.onAdd({...values.user, phoneNumber: values.user?.phoneNumber?.value});
  },
})(AddMemberModalV2);

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType'),
});

export default withTranslation()(
  connect(mapStateToProps, null)(EnhancedForm)
);
