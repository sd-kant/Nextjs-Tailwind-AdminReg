import React, {useMemo, useEffect} from "react";
import Modal from "react-modal";
import {connect} from "react-redux";
import {get} from "lodash";
import clsx from "clsx";
import style from "./AddMemberModalV2.module.scss";
import {
  customStyles,
  defaultTeamMember,
  userSchema
} from "../partials/su-dashboard/FormInvite";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import removeIcon from "../../assets/images/remove.svg";
import ResponsiveSelect from "./ResponsiveSelect";
import {useMembersContext} from "../../providers/MembersProvider";
import CustomPhoneInput from "./PhoneInput";

const formSchema = (t) => {
  return Yup.object().shape({
    user: userSchema(t),
  });
};

const AddMemberModalV2 = (
  {
    t,
    isOpen = false,
    onClose,
    permissionLevels,
    setFieldValue,
    values,
    resetForm,
    errors,
    touched,
  }) => {
  const {user} = values;
  const {jobs} = useMembersContext();
  const options = useMemo(() => permissionLevels.filter(it => ["1", "2"].includes(it.value?.toString())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);


  useEffect(() => {
    if (isOpen) {
      resetForm({
        values: {
          user: defaultTeamMember,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <img src={removeIcon} alt="remove icon" />
          </div>

          <div className={clsx(style.Header)}>
            <span className={'font-modal-header text-white'}>{t('enter new team member information')}</span>
            <br/>
            <span className={'font-modal-header text-white'}>{t('must include email or phone')}</span>
          </div>
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

                  <ResponsiveSelect
                    className='mt-10 font-heading-small text-black select-custom-class'
                    placeholder={t("select")}
                    styles={customStyles()}
                    options={jobs}
                    maxMenuHeight={190}
                    value={user.job}
                    name={'user.job'}
                    onChange={(e) => {
                      setFieldValue('user.job', e)
                    }}
                  />

                  {
                    touched?.user && touched.user?.job &&
                    errors?.user && errors.user?.job && (
                      <span className="font-helper-text text-error mt-10">{errors.user.job}</span>
                    )
                  }
                </div>

                <div className={clsx("d-flex flex-column")}>
                  <label className="font-input-label text-white text-capitalize">
                    {t("permission level")}
                  </label>

                  <ResponsiveSelect
                    className='mt-10 font-heading-small text-black select-custom-class'
                    placeholder={t("select")}
                    styles={customStyles()}
                    options={options}
                    value={user.userType}
                    name={'user.userType'}
                    onChange={(e) => setFieldValue('user.userType', e)}
                  />

                  {
                    touched?.user && touched.user?.userType &&
                    errors?.user && errors.user?.userType && (
                      <span className="font-helper-text text-error mt-10">{errors.user.userType}</span>
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
                  ) : null
                }
              </div>
            </div>
          </div>
          <div className={clsx(style.Footer)}>
            <button
              className={`button active cursor-pointer`}
              type={"submit"}
            >
              <span className='font-button-label text-white text-uppercase'>
                {t("invite team member")}
              </span>
            </button>
          </div>
        </div>
      </Form>
    </Modal>
  )
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({user: defaultTeamMember}),
  validationSchema: ((props) => formSchema(props.t)),
  enableReinitialize: true,
  handleSubmit: async (values, {props}) => {
    props.onAdd({
      ...values.user,
      firstName: values?.user?.firstName?.trim() ?? 'first name',
      lastName: values?.user?.lastName?.trim() ?? 'last name',
    });
  },
})(AddMemberModalV2);

const mapStateToProps = (state) => ({
  isAdmin: get(state, 'auth.isAdmin'),
  userType: get(state, 'auth.userType'),
});

export default withTranslation()(
  connect(mapStateToProps, null)(EnhancedForm)
);
