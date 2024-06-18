import React, { useMemo, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Yup from 'yup';
import { Form, useFormikContext, withFormik } from 'formik';
import { withTranslation, Trans } from 'react-i18next';
import plusIcon from 'assets/images/plus-circle-fire.svg';
import removeIcon from 'assets/images/remove.svg';
import { get } from 'lodash';
import {
  setLoadingAction,
  setRestBarClassAction,
  setVisibleSuccessModalAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from 'redux/action/ui';
import { AVAILABLE_JOBS, INVALID_VALUES1, INVALID_VALUES3, permissionLevels } from 'constant';
import ConfirmModal from 'views/components/ConfirmModal';
import CustomPhoneInput from 'views/components/PhoneInput';
import { checkPhoneNumberValidation } from 'utils';
import ResponsiveSelect from 'views/components/ResponsiveSelect';
import SuccessModal from 'views/components/SuccessModal';
import { logout } from 'views/layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import { _handleSubmitV2, checkIfSpacesOnly } from 'utils/invite';
import { AsYouType } from 'libphonenumber-js';
import style from './FormInvite.module.scss';
import clsx from 'clsx';
import PreviousButton from 'views/components/PreviousButton';

export const defaultTeamMember = {
  email: '',
  firstName: '',
  lastName: '',
  userType: '',
  job: '',
  phoneNumber: {
    value: '',
    countryCode: ''
  }
};

export const userSchema = (t) => {
  return Yup.object()
    .shape({
      email: Yup.string().email(t('email invalid')).max(1024, t('email max error')),
      // .test('required', t('email or phone number required'), function (value) {
      //   if (value) return true;
      //   return !!this.parent.phoneNumber.value;
      // }),
      firstName: Yup.string()
        .test('is-valid', t('firstName required'), function (value) {
          return !checkIfSpacesOnly(value);
        })
        .required(t('firstName required'))
        .max(50, t('firstName max error')),
      lastName: Yup.string()
        .test('is-valid', t('lastName required'), function (value) {
          return !checkIfSpacesOnly(value);
        })
        .required(t('lastName required'))
        .max(50, t('lastName max error')),
      userType: Yup.object().required(t('permission level required')),
      job: Yup.object().required(t('role required')),
      phoneNumber: Yup.object()
        // .test('required', t('email or phone number required'), function (obj) {
        //   if (obj?.value) return true;
        //   return !!this.parent.email;
        // })
        .test('is-valid', t('phone number invalid'), function (obj) {
          if (!obj?.value) return true;
          return checkPhoneNumberValidation(obj.value, obj.countryCode);
        })
    })
    .required();
};

const formSchema = (t) => {
  return Yup.object().shape({
    users: Yup.array().of(userSchema(t))
  });
};

export const customStyles = (disabled = false) => ({
  menu: (provided) => {
    return {
      ...provided,
      zIndex: 2
    };
  },
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#DE7D2C'
      : state.isFocused
        ? '#5BAEB6'
        : state.data.color ?? 'white',
    zIndex: 1,
    color: 'black',
    fontSize: '21px',
    lineHeight: '24.13px'
  }),
  control: (styles) => ({
    ...styles,
    border: disabled ? '1px solid #272727' : 'none',
    outline: 'none',
    boxShadow: 'none',
    height: 54,
    backgroundColor: disabled ? '#2f2f2f' : '#272727',
    zIndex: 1
  }),
  input: (styles) => ({
    ...styles,
    color: 'white',
    zIndex: 1
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'white',
    zIndex: 1
  })
});

const FormInvite = (props) => {
  const {
    values,
    errors,
    touched,
    t,
    setFieldValue,
    setRestBarClass,
    status,
    setStatus,
    organizationId,
    id: teamId
  } = props;
  const navigate = useNavigate();
  const { submitForm } = useFormikContext();
  useEffect(() => {
    setRestBarClass('progress-72 medical');
    const csvDataStr = localStorage.getItem('kop-csv-data');
    const csvData = csvDataStr && JSON.parse(csvDataStr);

    const d = csvData?.map((it) => {
      const level = it.permissionLevel?.split(':')?.[0]?.trim();
      const job = it.jobRole?.toLowerCase()?.trim();
      const selectedLevel = permissionLevels.find((ele) => parseInt(ele.value) === parseInt(level));
      const selectedJob = AVAILABLE_JOBS.find((ele) => ele.value === job);
      let phoneNumber = null;
      let country = null;
      if (it.phoneNumber !== 'null') {
        phoneNumber =
          !(INVALID_VALUES3.includes(it.countryCode) && INVALID_VALUES3.includes(it.phoneNumber))
            ? `${it.countryCode}${it.phoneNumber}`
            : null;
      }
      if (phoneNumber) {
        const phoneNumberWithPlus = phoneNumber ? `+${phoneNumber}` : null;
        if (phoneNumberWithPlus) {
          const asYouType = new AsYouType();
          asYouType.input(phoneNumberWithPlus);
          country = asYouType?.getCountry();
        }
      }

      return {
        email: !it.email || it.email === 'null' ? '' : it.email,
        firstName: it.firstName,
        lastName: it.lastName,
        userType: selectedLevel || '',
        job: selectedJob || '',
        phoneNumber: {
          value: phoneNumber,
          countryCode: phoneNumber ? country : ''
        }
      };
    });
    d && setFieldValue('users', d);
    localStorage.removeItem('kop-csv-data');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeFormField = (e) => {
    const { value, name } = e.target;

    setFieldValue(name, value);
  };

  const changeHandler = (fieldName, value) => {
    setFieldValue(fieldName, value);
  };

  const sortedJobs =
    AVAILABLE_JOBS &&
    AVAILABLE_JOBS.sort((a, b) => {
      return a.label > b.label ? 1 : -1;
    });

  const addAnother = () => {
    const data = JSON.parse(JSON.stringify(values['users']));
    data.push(defaultTeamMember);
    setFieldValue('users', data);
  };

  const deleteMember = (index) => {
    const data = JSON.parse(JSON.stringify(values['users']));
    data.splice(index, 1);
    setFieldValue('users', data);
  };

  const pathname = window.location.pathname;
  const isManual = pathname.split('/').includes('manual');

  const options = useMemo(
    () => permissionLevels.filter((it) => ['1', '2'].includes(it.value?.toString())),
    []
  );

  const renderUser = (user, index, key) => {
    let errorField = errors?.users?.[user.index];
    let touchField = touched?.users?.[user.index];
    const formInputName = `users[${user.index}]`;
    const v = values?.users?.[user.index];

    return (
      <div className={clsx(style.User)} key={`${key}-${index}`}>
        <img
          src={removeIcon}
          className={clsx(style.RemoveIcon)}
          alt="remove icon"
          onClick={() => deleteMember(index)}
        />

        <div className={clsx(style.UserRow)}>
          <div className="d-flex flex-column">
            <label className="font-input-label">{t('firstName')}</label>

            <input
              className={clsx(style.Input, 'input mt-10 font-heading-small text-white')}
              name={`${formInputName}.firstName`}
              value={v?.firstName}
              type="text"
              onChange={changeFormField}
            />

            {touchField?.firstName && errorField?.firstName && (
              <span className="font-helper-text text-error mt-10">{errorField.firstName}</span>
            )}
          </div>

          <div className="d-flex flex-column">
            <label className="font-input-label">{t('lastName')}</label>

            <input
              className={clsx(style.Input, 'input mt-10 font-heading-small text-white')}
              name={`${formInputName}.lastName`}
              value={v?.lastName}
              type="text"
              onChange={changeFormField}
            />

            {touchField?.lastName && errorField?.lastName && (
              <span className="font-helper-text text-error mt-10">{errorField.lastName}</span>
            )}
          </div>
        </div>

        <div className={clsx(style.UserRow)}>
          <div className="d-flex flex-column">
            <label className="font-input-label">{t('email')}</label>

            <input
              className={clsx(style.Input, 'input mt-10 font-heading-small text-white')}
              name={`${formInputName}.email`}
              value={v?.email}
              type="text"
              onChange={changeFormField}
            />

            {touchField?.email && errorField?.email && (
              <span className="font-helper-text text-error mt-10">{errorField.email}</span>
            )}
          </div>

          <div className={clsx(style.SelectWrapper, 'd-flex')}>
            <div className="d-flex flex-column">
              <label className="font-input-label text-white text-capitalize">{t('job')}</label>

              <ResponsiveSelect
                className="mt-10 font-heading-small text-black select-custom-class"
                options={sortedJobs}
                name={`${formInputName}.job`}
                value={v?.job}
                styles={customStyles()}
                maxMenuHeight={190}
                menuPortalTarget={document.body}
                menuPosition={'fixed'}
                onChange={(value) => changeHandler(`${formInputName}.job`, value)}
                placeholder={t('select')}
              />
              {touchField?.job && errorField?.job && (
                <span className="font-helper-text text-error mt-10">{errorField.job}</span>
              )}
            </div>

            <div className={clsx('d-flex flex-column')}>
              <label className="font-input-label text-white text-capitalize">
                {t('permission level')}
              </label>

              <ResponsiveSelect
                className="mt-10 font-heading-small text-black select-custom-class"
                options={options}
                // options={permissionLevels}
                name={`${formInputName}.userType`}
                value={v?.userType}
                styles={customStyles()}
                menuPortalTarget={document.body}
                menuPosition={'fixed'}
                onChange={(value) => changeHandler(`${formInputName}.userType`, value)}
                placeholder={t('select')}
              />
              {touchField?.userType && errorField?.userType && (
                <span className="font-helper-text text-error mt-10">{errorField.userType}</span>
              )}
            </div>
          </div>
        </div>

        <div className={clsx(style.UserRow)}>
          <div>
            <label className="font-input-label">{t('phone number')}</label>
            <CustomPhoneInput
              containerClass={style.PhoneNumberContainer}
              inputClass={style.PhoneNumberInput}
              dropdownClass={style.PhoneNumberDropdown}
              value={user?.phoneNumber?.value}
              onChange={(value, countryCode) =>
                changeHandler(`${formInputName}.phoneNumber`, { value, countryCode })
              }
            />
            {touchField?.phoneNumber && errorField?.phoneNumber ? (
              <span className="font-helper-text text-error mt-10">{errorField.phoneNumber}</span>
            ) : null}
          </div>

          <div />
        </div>
      </div>
    );
  };

  const operators = values?.users?.reduce((ret, it, index) => {
    if (it.userType?.value?.toString() === '2' || ['', null, undefined].includes(it.userType)) {
      ret.push({
        ...it,
        index
      });
    }

    return ret;
  }, []);

  const admins = values?.users?.reduce((ret, it, index) => {
    if (it.userType?.value?.toString() === '1') {
      ret.push({
        ...it,
        index
      });
    }

    return ret;
  }, []);

  const num = React.useMemo(() => {
    return values.users?.length ?? 0;
  }, [values.users]);

  const ableToSubmit = React.useMemo(() => values['users']?.length > 0, [values]);

  const handleSubmit = () => {
    if (!ableToSubmit) return;
    submitForm().then();
  };

  const handleBack = () => {
    navigate(`/invite/${organizationId}/team-mode`);
  };

  return (
    <React.Fragment>
      <ConfirmModal
        show={status?.visibleWarningModal}
        header={'Warning'}
        subheader={
          'Please note, the following team members were already invited and will not receive a new email invitation'
        }
        onOk={() => {
          setStatus({ visibleWarningModal: false, alreadyRegisteredUsers: [] });
          if (status?.leavePage) {
            setStatus({ visibleSuccessModal: true });
          }
        }}
        okText={t('ok')}
        content={
          <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
            {status?.alreadyRegisteredUsers?.map((it) => (
              <div className={clsx('mt-10')} key={it.email}>
                <span>{it.email}</span>
              </div>
            ))}
          </div>
        }
      />

      <SuccessModal
        show={status?.visibleSuccessModal}
        data={status}
        onCancel={() => {
          setStatus({ visibleSuccessModal: false });
          navigate(`/invite/${organizationId}/team-mode`);
        }}
        onOk={() => {
          setStatus({ visibleSuccessModal: false });
          logout();
        }}
      />

      <Form className="form-group mt-57">
        <div>
          <div className="tw-flex">
            <PreviousButton onClick={() => navigate(-1)}>{t('previous')}</PreviousButton>
          </div>

          <div className={clsx(style.FormHeader, 'd-flex flex-column')}>
            <div className={clsx(style.Header)}>
              <div className={clsx('d-flex align-center', style.Title)}>
                <span className="font-header-medium d-block">{t('create team')}</span>
              </div>
              <div />
              <div className={clsx('d-flex align-center', style.ChangeNote)}>
                <span className="text-capitalize">
                  {num === 0
                    ? t('no new team member')
                    : num > 1
                      ? t('n new team members', { n: num })
                      : t('n new team member', { n: 1 })}
                </span>
              </div>
            </div>

            <div className={clsx(style.Tools)}>
              <div className={clsx(style.ReUploadWrapper)}>
                {!isManual ? (
                  <span className={clsx('font-binary', style.ReUpload)}>
                    <Trans
                      i18nKey={'reupload csv'}
                      components={{
                        a: (
                          <span
                            className={'text-orange'}
                            onClick={() => navigate(`/invite/${organizationId}/upload/${teamId}`)}
                          />
                        )
                      }}
                    />
                  </span>
                ) : null}
              </div>

              <div className={clsx(style.ButtonWrapper)}>
                <button
                  className={`button ${
                    ableToSubmit ? 'active cursor-pointer' : 'inactive cursor-default'
                  }`}
                  type={values['users']?.length > 0 ? 'submit' : 'button'}>
                  <span className="font-button-label text-white text-uppercase">{t('save')}</span>
                </button>

                <button
                  className={clsx(style.CancelBtn, `button cursor-pointer cancel`)}
                  type={'button'}
                  onClick={handleBack}>
                  <span className="font-button-label text-orange text-uppercase">
                    {t('cancel')}
                  </span>
                </button>
              </div>

              <div className={clsx(style.LabelWrapper)}>
                <div>
                  <span
                    className="text-orange font-input-label text-uppercase"
                    onClick={addAnother}>
                    {t('add')}
                  </span>
                </div>

                <div>
                  <span
                    className={`${
                      ableToSubmit ? `text-orange` : 'text-gray-2'
                    } font-input-label text-uppercase`}
                    onClick={handleSubmit}>
                    {t('save')}
                  </span>
                </div>

                <div>
                  <span
                    className="text-orange font-input-label text-uppercase"
                    onClick={handleBack}>
                    {t('cancel')}
                  </span>
                </div>
              </div>
            </div>

            <div className={clsx(style.AddButton)} onClick={addAnother}>
              <img src={plusIcon} className={clsx(style.PlusIcon)} alt="plus icon" />
              <span className="font-heading-small">{t('add a team member')}</span>
            </div>
          </div>

          <div className={clsx(style.FormBody, 'd-flex flex-column')}>
            {operators?.length > 0 && (
              <div className="mt-28">
                <span className="font-heading-small text-uppercase text-orange">
                  {t('operators')}
                </span>
              </div>
            )}

            {operators?.map((user) => renderUser(user, user.index, 'user'))}

            {admins?.length > 0 && (
              <div className="mt-28">
                <span className="font-heading-small text-uppercase text-orange">
                  {t('administrators')}
                </span>
              </div>
            )}

            {admins?.map((user) => renderUser(user, user.index, 'admin'))}
          </div>
        </div>
      </Form>
    </React.Fragment>
  );
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    users: []
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: async (values, { props, setStatus }) => {
    const {
      showErrorNotification,
      setLoading,
      t,
      organizationId,
      id: teamId,
      navigate,
      isAdmin
    } = props;
    let users = values?.users;

    if (INVALID_VALUES1.includes(organizationId?.toString())) {
      showErrorNotification(t('msg create organization before inviting users'));
      navigate('/invite/company');
    } else {
      if (users?.length > 0) {
        users = users.map((it) => ({
          ...it,
          firstName: it?.firstName?.trim() ?? 'first name',
          lastName: it?.lastName?.trim() ?? 'last name'
        }));

        const { numberOfSuccess, succeedRegisteredUsers, alreadyRegisteredUsers } = await _handleSubmitV2({
          users,
          setLoading,
          organizationId,
          teamId,
          isAdmin,
          showErrorNotification,
          t
        });

        if (numberOfSuccess > 0) {
          setStatus({
            visibleSuccessModal: true,
            succeedRegisteredUsers,
            alreadyRegisteredUsers,
            numberOfSuccess
          });
        }
      }
    }
  }
})(FormInvite);

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType'),
  isAdmin: get(state, 'auth.isAdmin')
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      setRestBarClass: setRestBarClassAction,
      setVisibleSuccessModal: setVisibleSuccessModalAction,
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(EnhancedForm));
