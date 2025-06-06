import React, { useMemo, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Form, withFormik } from 'formik';
import { bindActionCreators } from 'redux';
import CreatableSelect from 'react-select/creatable';
import {
  createCompany,
  createUserByAdmin,
  getUsersUnderOrganization,
  updateCompany
} from '../../../http';
import {
  setLoadingAction,
  setRestBarClassAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from '../../../redux/action/ui';
import {
  passwordExpirationDaysOptions,
  passwordMinLengthOptions,
  twoFAOptions,
  USER_TYPE_ORG_ADMIN,
  hideCbtHROptions,
  medicalQuestionnaireOptions
} from '../../../constant';
import { queryAllOrganizationsAction } from '../../../redux/action/base';
import { get, isEqual } from 'lodash';
import ButtonGroup from '../../components/ButtonGroup';
import clsx from 'clsx';
import style from './FormCompany.module.scss';
import ResponsiveSelect from '../../components/ResponsiveSelect';
import MultiSelectPopup from '../../components/MultiSelectPopup';
import countryRegions from 'country-region-data/data.json';
import removeIcon from '../../../assets/images/remove.svg';
import plusCircleFire from '../../../assets/images/plus-circle-fire.svg';
import { defaultMember, lowercaseEmail, setUserTypeToUsers } from './FormRepresentative';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/ConfirmModal';
import { checkIfSpacesOnly } from '../../../utils/invite';
// import { isValidMacAddress } from 'utils';
import BThubGenTokenModal from '../../modals/organization/BThubGenTokenModal';
import { queryGetAllHubProfiles } from 'http/organization';
import OkModal from 'views/modals/OkModal';

export const customStyles = () => ({
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#DE7D2C' : state.isFocused ? '#5BAEB6' : 'white',
    color: 'black',
    fontSize: '21px',
    lineHeight: '24.13px',
    zIndex: 1
  }),
  control: (styles) => ({
    ...styles,
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
    zIndex: 1
  }),
  menu: (styles) => ({
    ...styles,
    zIndex: 2,
    backgroundColor: 'white'
  }),
  input: (styles) => ({ ...styles, zIndex: 1 }),
  singleValue: (provided) => ({ ...provided, zIndex: 1 })
});

const formSchema = (t) => {
  return Yup.object().shape({
    companyName: Yup.object()
      .shape({
        label: Yup.string()
          .test('is-valid', t('company name required'), function (value) {
            return !checkIfSpacesOnly(value);
          })
          .test('is-valid', t('company name min error'), function (value) {
            return value?.trim()?.length >= 6;
          })
          .required(t('company name required'))
          .min(6, t('company name min error'))
          .max(1024, t('company name max error'))
      })
      .nullable()
      .required(t('company name required')),
    editingCompanyName: Yup.string()
      .test('is-valid', t('company name required'), function (value) {
        return this.parent.isEditing ? !checkIfSpacesOnly(value) : true;
      })
      .test('is-valid', t('company name min error'), function (value) {
        return this.parent.isEditing ? value?.trim()?.length >= 6 : true;
      })
      .min(6, t('company name min error'))
      .max(1024, t('company name max error')),
    companyCountry: Yup.array()
      .required(t('company country required'))
      .test('is-valid', t('company country required'), function (value) {
        return value?.length > 0;
      })
      .test('is-valid', t('up to n countries', { n: 25 }), function (value) {
        return value?.length <= 25;
      }),
    // regions: Yup.array().required(t('company region required')),
    twoFA: Yup.boolean(),
    medicalQuestionnaire: Yup.number(),
    passwordMinimumLength: Yup.number(),
    passwordExpirationDays: Yup.number(),
    hideCbtHR: Yup.boolean(),
    users: Yup.array().of(
      Yup.object()
        .shape({
          email: Yup.string()
            .required(t('email required'))
            .email(t('email invalid'))
            .max(1024, t('email max error')),
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
            .max(50, t('lastName max error'))
        })
        .required()
    ),
    // bluetoothTokens: Yup.array().of(
    //   Yup.object()
    //     .shape({
    //       macAddress: Yup.string()
    //         .required(t('device id required'))
    //         .test('is-valid', t('device id invalid'), function (value) {
    //           return isValidMacAddress(value);
    //         }),
    //       refreshToken: Yup.string().required()
    //     })
    //     .required()
    // ),
    sso: Yup.boolean(),
    samlUrl: Yup.string()
      .url(t('saml url invalid'))
      .test('is-valid', t('saml url invalid'), function (value) {
        const isEditing = this.parent.companyName?.__isNew__ || this.parent.isEditing;
        if (isEditing && this.parent.sso) {
          return !!value;
        }
        return true;
      }),
    samlLogoutUrl: Yup.string()
      .url(t('saml logout url invalid'))
      .test('is-valid', t('saml logout url invalid'), function (value) {
        const isEditing = this.parent.companyName?.__isNew__ || this.parent.isEditing;
        if (isEditing && this.parent.sso) {
          return !!value;
        }
        return true;
      }),
    samlIssuer: Yup.string().test('is-valid', t('saml issuer invalid'), function (value) {
      const isEditing = this.parent.companyName?.__isNew__ || this.parent.isEditing;
      if (isEditing && this.parent.sso) {
        return !checkIfSpacesOnly(value);
      }
      return true;
    }),
    idp: Yup.string().test('is-valid', t('idp invalid'), function (value) {
      const validList = ['aad'];
      const isEditing = this.parent.companyName?.__isNew__ || this.parent.isEditing;
      if (isEditing && this.parent.sso) {
        return validList.includes(value);
      }
      return true;
    })
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
    setStatus,
    setValues,
    status: { visibleModal, visibleChangeEditModal }
  } = props;

  const options = useMemo(
    () => countryRegions?.map((it) => ({ label: it.countryName, value: it.countryShortCode })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [countryRegions]
  );
  const [orgAdmins, setOrgAdmins] = React.useState([]);
  const [bluetoothTokens, setBluetoothTokens] = React.useState([]);
  const [isOpenBThubGentTokenModal, setIsOpenBThubGentTokenModal] = React.useState(false);
  const [isOpenSuccessCopyToken, setIsOpenSuccessCopyToken] = React.useState(false);
  const navigate = useNavigate();
  React.useEffect(() => {
    setFieldValue('users', []);
    // setFieldValue('bluetoothTokens', []);
    setBluetoothTokens([]);
    if (!values.companyName?.__isNew__ && values.companyName?.value) {
      fetchOrgAdmins(values.companyName?.value);
      fetchOrgHubProfiles(values.companyName?.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.companyName?.value, values.isEditing]);

  const fetchOrgAdmins = (organizationId) => {
    getUsersUnderOrganization({
      organizationId,
      userType: 'OrgAdmin'
    })
      .then((res) => {
        setOrgAdmins(res.data ?? []);
      })
      .catch((e) => {
        console.error('get org admin error', e);
      });
  };

  const fetchOrgHubProfiles = (organizationId) => {
    queryGetAllHubProfiles(organizationId)
      .then((res) => {
        setBluetoothTokens(
          res.data?.map((it) => {
            return {
              macAddress: it.deviceId,
              refreshToken: it.refreshToken
            };
          })
        );
      })
      .catch((e) => {
        console.error('get org hub profiles error', e);
      });
  };
  useEffect(() => {
    setRestBarClass('progress-0 medical');
    queryAllOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [organizations, setOrganizations] = useState([]);
  const changeFormField = (e) => {
    const { value, name } = e.target;
    setFieldValue(name, value);
  };
  const deleteMember = (index) => {
    const data = JSON.parse(JSON.stringify(values['users']));
    data.splice(index, 1);
    setFieldValue('users', data);
  };
  const addAnother = () => {
    const data = JSON.parse(JSON.stringify(values['users']));
    data.push(defaultMember);
    setFieldValue('users', data);
  };
  const addBluetoothTokens = (newToken) => {
    // setFieldValue('bluetoothTokens', [...values['bluetoothTokens'], newToken]);
    setBluetoothTokens([...bluetoothTokens, newToken]);
  };
  const changeHandler = (key, value) => {
    if (key === 'companyName') {
      if (value?.__isNew__) {
        setValues({
          companyCountry: [],
          regions: [],
          twoFA: false,
          passwordMinimumLength: 10,
          passwordExpirationDays: 0,
          hideCbtHR: false,
          users: [],
          sso: false,
          samlUrl: '',
          samlLogoutUrl: '',
          samlIssuer: '',
          idp: ''
        });
      } else if (value?.created) {
        // if already created company, then set country according to picked company
        const country = options?.filter((entity) => value.country.includes(entity.label));
        if (country?.length > 0) {
          setFieldValue('companyCountry', country);
        } else {
          setFieldValue('companyCountry', [options?.[0]]);
        }
        const fields = [
          'twoFA',
          'medicalQuestionnaire',
          'passwordMinimumLength',
          'passwordExpirationDays',
          'hideCbtHR',
          'sso',
          'samlUrl',
          'samlLogoutUrl',
          'samlIssuer',
          'idp'
        ];
        fields?.forEach((item) => setFieldValue(item, value[item]));
      }
    }
    setFieldValue(key, value);
  };

  useEffect(() => {
    setOrganizations(
      (allOrganizations &&
        allOrganizations.map((organization) => ({
          value: organization.id,
          label: organization.name,
          country: organization.country?.split('@') ?? [],
          twoFA: organization.settings?.twoFA ?? false,
          medicalQuestionnaire: organization.settings?.medicalQuestionnaire ?? 1,
          passwordMinimumLength: organization.settings?.passwordMinimumLength ?? 10,
          passwordExpirationDays: organization.settings?.passwordExpirationDays ?? 0,
          hideCbtHR: organization.settings?.hideCbtHR ?? false,
          sso: organization.settings?.sso ?? false,
          samlUrl: organization.settings?.samlUrl ?? '',
          samlLogoutUrl: organization.settings?.samlLogoutUrl ?? '',
          samlIssuer: organization.settings?.samlIssuer ?? '',
          idp: organization.settings?.idp ?? '',
          created: true
        }))) ||
        []
    );
  }, [allOrganizations]);

  useEffect(() => {
    if (organizations?.length > 0 && values['companyName']?.value) {
      changeHandler(
        'companyName',
        organizations.find(
          (it) => it.value?.toString() === values['companyName']?.value?.toString()
        )
      );
    } else if (isOrgAdmin) {
      changeHandler('companyName', organizations[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizations, isOrgAdmin]);

  const cancelEditing = () => {
    setFieldValue('isEditing', false);
    setFieldValue('selectedItem', null);
  };

  const enableEditing = () => {
    setFieldValue('isEditing', true);
    setFieldValue('selectedItem', values.companyName?.value);
    setFieldValue('editingCompanyName', values.companyName?.label);
  };

  const isEditing = useMemo(() => values.companyName?.__isNew__ || values['isEditing'], [values]);

  const countrySelectorLabel = React.useMemo(() => {
    if (values?.companyCountry?.length > 0) {
      if (options?.length > 1 && values?.companyCountry?.length === options?.length) {
        return t('all countries');
      } else if (values?.companyCountry?.length > 1) {
        return t('n countries selected', { n: values?.companyCountry.length });
      } else {
        return options?.find((it) => it.label === values?.companyCountry?.[0]?.label)?.label;
      }
    } else {
      return t('select country');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.companyCountry, options]);

  const handleCancel = () => {
    if (isEditing) {
      if (values.companyName?.__isNew__) setFieldValue('companyName', '');

      cancelEditing();
    } else {
      navigate('/select-mode');
    }
  };

  const changes = React.useMemo(() => {
    const ret = [];
    const organization = organizations?.find(
      (it) => it.value?.toString() === values.selectedItem?.toString()
    );
    if (values.selectedItem && organization) {
      if (
        values?.companyName?.label?.toString()?.trim() !==
        values?.editingCompanyName?.toString()?.trim()
      ) {
        ret.push('name');
      }
      const countries = (values?.companyCountry ?? []).map((it) => it.label);
      const orgCountries = JSON.parse(JSON.stringify(organization?.country ?? []));
      if (!isEqual(countries?.sort(), orgCountries?.sort())) {
        ret.push('country');
      }

      if (values?.users?.length > 0) {
        ret.push('admin');
      }

      if (values?.hideCbtHR !== organization?.hideCbtHR) {
        ret.push('hideCbtHR');
      }

      if (values?.sso !== organization?.sso) {
        ret.push('sso');
      }

      if (values?.medicalQuestionnaire !== organization?.medicalQuestionnaire) {
        ret.push('medicalQuestionnaire');
      }

      let fields;
      if (values?.sso) {
        fields = ['samlUrl', 'samlLogoutUrl', 'samlIssuer', 'idp'];
      } else {
        fields = ['twoFA', 'passwordMinimumLength', 'passwordExpirationDays'];
      }
      if (fields) {
        fields.forEach((item) => {
          if (values?.[item] !== organization?.[item]) {
            ret.push(item);
          }
        });
      }
    }
    return ret;
  }, [values, organizations]);

  return (
    <React.Fragment>
      <Form className="form mt-57">
        <div className={clsx(style.TopWrapper)}>
          <div className="grouped-form">
            <label className="font-header-medium">
              {values.isEditing
                ? t('edit company')
                : isSuperAdmin
                  ? t('create or select company')
                  : t('welcome')}
            </label>
          </div>

          <div className="d-flex flex-column mt-40">
            <label className="font-input-label">{t('company name')}</label>
            {values.isEditing ? (
              <input
                className="input input-field mt-10 font-heading-small text-white"
                name="editingCompanyName"
                value={values['editingCompanyName']}
                type="text"
                onChange={changeFormField}
              />
            ) : isSuperAdmin ? (
              <CreatableSelect
                className="mt-10 font-heading-small text-black input-field"
                isClearable
                options={organizations}
                value={values['companyName']}
                name="companyName"
                styles={customStyles()}
                placeholder={t('enter name')}
                onChange={(value) => changeHandler('companyName', value)}
              />
            ) : (
              <ResponsiveSelect
                className="mt-10 font-heading-small text-black input-field"
                options={organizations}
                value={values['companyName']}
                name="companyName"
                styles={customStyles()}
                menuPortalTarget={document.body}
                menuPosition={'fixed'}
                placeholder={t('enter name')}
                onChange={(value) => changeHandler('companyName', value)}
              />
            )}
            {values['isEditing']
              ? touched.editingCompanyName &&
                errors.editingCompanyName && (
                  <span className="font-helper-text text-error mt-10">
                    {errors.editingCompanyName}
                  </span>
                )
              : touched.companyName &&
                errors.companyName && (
                  <span className="font-helper-text text-error mt-10">
                    {errors.companyName?.label}
                  </span>
                )}
          </div>

          {values.companyName?.created && !values.isEditing ? (
            <div className="d-flex flex-column mt-25">
              <label
                className={`font-binary d-block mt-8 text-capitalize text-orange cursor-pointer`}
                onClick={enableEditing}>
                {t('edit')}
              </label>
            </div>
          ) : null}

          {isEditing && (
            <div className="mt-40 d-flex flex-column">
              <label className="font-input-label">{t('company country')}</label>

              <div className="mt-10 input-field">
                <MultiSelectPopup
                  label={countrySelectorLabel}
                  options={options}
                  value={values['companyCountry']}
                  onChange={(value) => changeHandler('companyCountry', value)}
                />
              </div>

              {touched.companyCountry && errors.companyCountry && (
                <span className="font-helper-text text-error mt-10">{errors.companyCountry}</span>
              )}
            </div>
          )}

          {values.isEditing && (
            <React.Fragment>
              <div className="grouped-form mt-40">
                <label className="font-header-medium">{t('company administrators')}</label>
              </div>
              <div className="grouped-form mt-25" style={{ maxWidth: '700px', overFlowY: 'auto' }}>
                {orgAdmins?.map((user, index) => (
                  <div
                    className={`team-representative-wrapper d-flex ${index !== 0 ? 'mt-25' : ''}`}
                    key={`already-registered-member-${index}`}>
                    <div className="d-flex flex-column">
                      {index === 0 && (
                        <label className="font-input-label text-white">{t('firstName')}</label>
                      )}

                      <input
                        className={clsx(
                          style.DisabledInput,
                          'input font-binary text-white mt-10 px-15'
                        )}
                        defaultValue={user?.firstName}
                        disabled
                        type="text"
                        style={{ width: '145px' }}
                      />
                    </div>

                    <div className="d-flex flex-column ml-25">
                      {index === 0 && (
                        <label className="font-input-label text-white">{t('lastName')}</label>
                      )}

                      <input
                        className={clsx(
                          style.DisabledInput,
                          'input font-binary text-white mt-10 px-15'
                        )}
                        defaultValue={user?.lastName}
                        disabled
                        type="text"
                        style={{ width: '145px' }}
                      />
                    </div>

                    <div className={clsx('d-flex flex-column ml-25')}>
                      {index === 0 && (
                        <div className={clsx(style.EmailHeaderLabel)}>
                          <label className="font-input-label text-white">
                            {t('administrator email')}
                          </label>
                        </div>
                      )}

                      <input
                        className={clsx(
                          style.DisabledInput,
                          'input font-binary text-white mt-10 px-15'
                        )}
                        defaultValue={user?.email}
                        disabled
                        type="text"
                        style={{ width: '195px' }}
                      />
                    </div>
                  </div>
                ))}
                {values &&
                  values['users'] &&
                  values['users'].map((user, index) => {
                    return (
                      <div
                        className={`team-representative-wrapper d-flex ${
                          orgAdmins.length !== 0 || index !== 0 ? 'mt-25' : ''
                        }`}
                        key={`member-${index}`}>
                        <div className="d-flex flex-column">
                          {orgAdmins?.length === 0 && index === 0 && (
                            <label className="font-input-label text-white">{t('firstName')}</label>
                          )}

                          <input
                            className="input font-binary text-white mt-10 px-15"
                            name={`users[${index}].firstName`}
                            value={
                              values?.users && values.users[index] && values.users[index]?.firstName
                            }
                            type="text"
                            style={{ width: '145px' }}
                            onChange={changeFormField}
                          />

                          {touched?.users &&
                            touched.users[index] &&
                            touched.users[index]?.firstName &&
                            errors?.users &&
                            errors.users[index] &&
                            errors.users[index]?.firstName && (
                              <span className="font-helper-text text-error mt-10">
                                {errors.users[index].firstName}
                              </span>
                            )}
                        </div>

                        <div className="d-flex flex-column ml-25">
                          {orgAdmins?.length === 0 && index === 0 && (
                            <label className="font-input-label text-white">{t('lastName')}</label>
                          )}

                          <input
                            className="input font-binary text-white mt-10 px-15"
                            name={`users[${index}].lastName`}
                            value={
                              values?.users && values.users[index] && values.users[index]?.lastName
                            }
                            type="text"
                            style={{ width: '145px' }}
                            onChange={changeFormField}
                          />

                          {touched?.users &&
                            touched.users[index] &&
                            touched.users[index]?.lastName &&
                            errors?.users &&
                            errors.users[index] &&
                            errors.users[index]?.lastName && (
                              <span className="font-helper-text text-error mt-10">
                                {errors.users[index].lastName}
                              </span>
                            )}
                        </div>

                        <div className="d-flex flex-column ml-25">
                          {orgAdmins?.length === 0 && index === 0 && (
                            <label className="font-input-label text-white">
                              {t('administrator email')}
                            </label>
                          )}

                          <input
                            className="input font-binary text-white mt-10 px-15"
                            name={`users[${index}].email`}
                            value={
                              values?.users && values.users[index] && values.users[index]?.email
                            }
                            type="text"
                            style={{ width: '195px' }}
                            onChange={changeFormField}
                          />

                          {touched?.users &&
                            touched.users[index] &&
                            touched.users[index]?.email &&
                            errors?.users &&
                            errors.users[index] &&
                            errors.users[index]?.email && (
                              <span className="font-helper-text text-error mt-10">
                                {errors.users[index].email}
                              </span>
                            )}
                        </div>

                        <div className="d-flex align-center ml-25" style={{ height: '45px' }}>
                          <img
                            className={`${
                              orgAdmins?.length === 0 && index === 0 ? 'mt-57' : 'mt-25'
                            } cursor-pointer`}
                            style={{ zIndex: 1 }}
                            src={removeIcon}
                            width={30}
                            height={30}
                            alt="close icon"
                            onClick={() => deleteMember(index)}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div
                className={`d-flex align-center mt-15 mb-15`}
                style={{ zIndex: 1, position: 'relative' }}>
                <img
                  src={plusCircleFire}
                  className="cursor-pointer"
                  onClick={addAnother}
                  alt="add icon"
                />
                <span className="font-binary cursor-pointer" onClick={addAnother}>
                  &nbsp;&nbsp;
                  {values.users?.length > 0 || orgAdmins?.length > 0
                    ? t('add another company admin')
                    : t('add company admin')}
                </span>
              </div>
            </React.Fragment>
          )}

          {values.isEditing && (
            <React.Fragment>
              <div className="grouped-form mt-40">
                <label className="font-header-medium">{t('bluetooth hub')}</label>
              </div>
              <div
                className="grouped-form mt-25 tw-gap-2"
                style={{ maxWidth: '700px', overFlowY: 'auto' }}>
                {bluetoothTokens?.map((token, index) => {
                  return (
                    <div
                      className="tw-flex tw-flex-col md:tw-flex-row md:tw-justify-between tw-gap-2"
                      key={`bt-token-box-${index}`}>
                      <div>
                        <span
                          className={clsx(
                            'tw-rounded-lg',
                            'tw-bg-neutral-800',
                            'tw-border-none',
                            'tw-outline-none',
                            'tw-z-1',
                            'tw-px-2',
                            'tw-text-xl',
                            'tw-text-zinc-300'
                          )}
                          id={`bt-mac-address-${index}`}>
                          {token.macAddress}
                        </span>
                      </div>
                      <div className="tw-flex tw-flex-col tw-gap-2">
                        <div>
                          <input
                            className={clsx(
                              'tw-rounded-lg',
                              'tw-bg-neutral-800',
                              'tw-border-none',
                              'tw-outline-none',
                              'tw-z-1',
                              'tw-text-base',
                              'tw-text-zinc-300',
                              'tw-w-[300px]'
                            )}
                            id={`bt-token-${index}`}
                            readOnly={true}
                            value={
                              '*'.repeat(43) +
                              token.refreshToken?.slice(token.refreshToken.length - 4)
                            }
                          />
                        </div>
                        <div className="tw-flex tw-justify-end">
                          <button
                            type="button"
                            className={clsx(
                              'tw-rounded-lg',
                              'tw-bg-neutral-800',
                              'tw-border-none',
                              'tw-outline-none',
                              'tw-z-1',
                              'tw-px-2',
                              'tw-text-base',
                              'tw-text-zinc-300',
                              'tw-uppercase'
                            )}
                            onClick={() => {
                              const copyText = document.getElementById(`bt-token-${index}`);

                              // Select the text field
                              copyText.select();
                              copyText.setSelectionRange(0, 99999); // For mobile devices

                              // Copy the text inside the text field
                              navigator.clipboard.writeText(token.refreshToken);
                              setIsOpenSuccessCopyToken(true);
                            }}>
                            {t('copy token')}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <OkModal
                isOpen={isOpenSuccessCopyToken}
                onClose={() => {
                  setIsOpenSuccessCopyToken(false);
                }}
              />
              <BThubGenTokenModal
                isOpen={isOpenBThubGentTokenModal}
                onClose={() => {
                  setIsOpenBThubGentTokenModal(false);
                }}
                orgId={values.selectedItem}
                addOn={addBluetoothTokens}
              />
              <div
                className={`d-flex align-center mt-15 mb-15`}
                style={{ zIndex: 1, position: 'relative' }}>
                <img
                  src={plusCircleFire}
                  className="cursor-pointer"
                  onClick={() => {
                    setIsOpenBThubGentTokenModal(true);
                  }}
                  alt="add icon"
                />
                <span
                  className="font-binary cursor-pointer"
                  onClick={() => {
                    setIsOpenBThubGentTokenModal(true);
                  }}>
                  &nbsp;&nbsp;
                  {values.users?.length > 0 || orgAdmins?.length > 0
                    ? t('add another bluetooth hub')
                    : t('add bluetooth hub')}
                </span>
              </div>
            </React.Fragment>
          )}

          {isEditing && (
            <React.Fragment>
              <div className="grouped-form mt-40">
                <label className="font-header-medium">{t('security')}</label>
              </div>

              <div className="d-flex flex-column mt-25">
                <label className="font-input-label">{t('sso organization')}</label>

                <div className="d-inline-block mt-10">
                  <ButtonGroup
                    options={twoFAOptions}
                    disabled={!values.companyName?.__isNew__ && !values['isEditing']}
                    value={values['sso']}
                    id={'sso-option'}
                    setValue={(v) => changeHandler('sso', v)}
                  />
                </div>
              </div>

              {values.sso ? (
                <>
                  <div className="d-flex flex-column mt-25">
                    <label className="font-input-label">{t('saml url')}</label>

                    <input
                      className="input input-field mt-10 font-heading-small text-white"
                      name="samlUrl"
                      value={values['samlUrl']}
                      type="text"
                      placeholder={t('enter saml url')}
                      onChange={changeFormField}
                    />

                    {touched?.samlUrl && errors?.samlUrl && (
                      <span className="font-helper-text text-error mt-10">{errors.samlUrl}</span>
                    )}
                  </div>

                  <div className="d-flex flex-column mt-25">
                    <label className="font-input-label">{t('saml logout url')}</label>

                    <input
                      className="input input-field mt-10 font-heading-small text-white"
                      name="samlLogoutUrl"
                      value={values['samlLogoutUrl']}
                      type="text"
                      placeholder={t('enter saml logout url')}
                      onChange={changeFormField}
                    />

                    {touched?.samlLogoutUrl && errors?.samlLogoutUrl && (
                      <span className="font-helper-text text-error mt-10">
                        {errors.samlLogoutUrl}
                      </span>
                    )}
                  </div>

                  <div className="d-flex flex-column mt-25">
                    <label className="font-input-label">{t('saml issuer')}</label>

                    <input
                      className="input input-field mt-10 font-heading-small text-white"
                      name="samlIssuer"
                      value={values['samlIssuer']}
                      type="text"
                      placeholder={t('enter saml issuer')}
                      onChange={changeFormField}
                    />

                    {touched?.samlIssuer && errors?.samlIssuer && (
                      <span className="font-helper-text text-error mt-10">{errors.samlIssuer}</span>
                    )}
                  </div>

                  <div className="d-flex flex-column mt-25">
                    <label className="font-input-label">{t('idp')}</label>

                    <input
                      className="input input-field mt-10 font-heading-small text-white"
                      name="idp"
                      value={values['idp']}
                      type="text"
                      placeholder={t('enter idp')}
                      onChange={changeFormField}
                    />

                    {touched?.idp && errors?.idp && (
                      <span className="font-helper-text text-error mt-10">{errors.idp}</span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="d-flex flex-column mt-25">
                    <label className="font-input-label">{t('2fa')}</label>

                    <div className="d-inline-block mt-10">
                      <ButtonGroup
                        options={twoFAOptions}
                        disabled={!values.companyName?.__isNew__ && !values['isEditing']}
                        value={values['twoFA']}
                        id={'2fa-option'}
                        setValue={(v) => changeHandler('twoFA', v)}
                      />
                    </div>
                  </div>

                  <div className="d-flex flex-column mt-25">
                    <label className="font-input-label">{t('password min length')}</label>

                    <div className="d-inline-block mt-10">
                      <ButtonGroup
                        size={'sm'}
                        rounded={true}
                        disabled={!values.companyName?.__isNew__ && !values['isEditing']}
                        options={passwordMinLengthOptions}
                        value={values['passwordMinimumLength']}
                        id={'password-min-length-option'}
                        setValue={(v) => changeHandler('passwordMinimumLength', v)}
                      />
                    </div>
                  </div>

                  <div className="d-flex flex-column mt-25">
                    <label className="font-input-label">{t('Password Expiration (Days)')}</label>

                    <div className="d-inline-block mt-10">
                      <ButtonGroup
                        size={'sm'}
                        rounded={true}
                        disabled={!values.companyName?.__isNew__ && !values['isEditing']}
                        options={passwordExpirationDaysOptions}
                        value={values['passwordExpirationDays']}
                        id={'password-expiration-days-option'}
                        setValue={(v) => changeHandler('passwordExpirationDays', v)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grouped-form mt-40">
                <label className="font-header-medium">{t('privacy')}</label>
              </div>

              <div className="d-flex flex-column mt-25">
                <label className="font-input-label">{t('org hide hr & cbt')}</label>

                <div className="d-inline-block mt-10">
                  <ButtonGroup
                    options={hideCbtHROptions}
                    disabled={!values.companyName?.__isNew__ && !values['isEditing']}
                    value={values['hideCbtHR']}
                    id={'hide-cbt-option'}
                    setValue={(v) => changeHandler('hideCbtHR', v)}
                  />
                </div>
              </div>
              <div className="d-flex flex-column mt-25">
                <label className="font-input-label">{t('medical questionnaire')}</label>

                <div className="d-inline-block mt-10">
                  <ButtonGroup
                    options={medicalQuestionnaireOptions}
                    disabled={!values.medicalQuestionnaire?.__isNew__ && !values['isEditing']}
                    value={values['medicalQuestionnaire']}
                    id={'medical-questionnaire-option'}
                    setValue={(v) => changeHandler('medicalQuestionnaire', v)}
                  />
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
        <div className="mt-80">
          {values.isEditing ? (
            <button
              className={`${
                changes?.length > 0 ? ' active cursor-pointer' : 'inactive cursor-default'
              } button`}
              type={changes?.length > 0 ? 'submit' : 'button'}>
              <span className="font-button-label text-white text-uppercase">{t('save')}</span>
            </button>
          ) : (
            <button className={'button active cursor-pointer'} type={'submit'}>
              <span className="font-button-label text-white text-uppercase">{t('next')}</span>
            </button>
          )}
          <button
            className={clsx(style.CancelBtn, `button cursor-pointer cancel`)}
            type={'button'}
            onClick={handleCancel}>
            <span className="font-button-label text-orange text-uppercase">{t('cancel')}</span>
          </button>
        </div>
      </Form>
      <ConfirmModal
        header={t('org admin invite sent')}
        show={visibleModal}
        onOk={() => setStatus({ visibleModal: false })}
      />
      <ConfirmModal
        show={visibleChangeEditModal}
        header={t('change saved')}
        okText={t('ok')}
        onOk={() => setStatus({ visibleChangeEditModal: false })}
      />
    </React.Fragment>
  );
};

const EnhancedForm = withFormik({
  mapPropsToStatus: () => ({
    visibleModal: false,
    visibleChangeEditModal: false
  }),
  mapPropsToValues: () => ({
    companyName: '',
    companyCountry: [],
    regions: [],
    twoFA: false,
    medicalQuestionnaire: 1,
    passwordMinimumLength: 10,
    passwordExpirationDays: 0,
    hideCbtHR: false,
    users: [],
    sso: false,
    samlUrl: '',
    samlLogoutUrl: '',
    samlIssuer: '',
    idp: ''
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: async (values, { props, setFieldValue, setStatus }) => {
    const { isSuperAdmin, navigate, setLoading } = props;
    let country = '';
    if (!Array.isArray(values?.companyCountry)) {
      country = values?.companyCountry?.label;
    } else {
      values?.companyCountry?.forEach((it) => {
        if (it?.label) {
          country += (country ? '@' : '') + it.label;
        }
      });
    }

    const data = {
      name: values.isEditing ? values?.editingCompanyName : values?.companyName?.label,
      country: country,
      settings: {
        sso: values.sso,
        samlUrl: values.samlUrl,
        samlLogoutUrl: values.samlLogoutUrl,
        samlIssuer: values.samlIssuer,
        idp: values.idp,
        twoFA: values.twoFA,
        medicalQuestionnaire: values.medicalQuestionnaire,
        passwordMinimumLength: values.passwordMinimumLength,
        passwordExpirationDays: values.passwordExpirationDays,
        expirationDaysEnable: values.passwordExpirationDays?.toString() !== '0',
        hideCbtHR: values.hideCbtHR
      }
    };
    if (values.isEditing) {
      const initialize = () => {
        setFieldValue('isEditing', false);
        setFieldValue('selectedItem', null);
        props.queryAllOrganizations();
      };

      if (values.selectedItem) {
        try {
          setLoading(true);
          const organizationId = values.selectedItem;
          await updateCompany(organizationId, data);
          setStatus({ visibleChangeEditModal: true });
          // creating org admins
          let users = values?.users;

          users = setUserTypeToUsers(lowercaseEmail(users), USER_TYPE_ORG_ADMIN)?.map((it) => ({
            ...it,
            firstName: it?.firstName?.trim() ?? 'first name',
            lastName: it?.lastName?.trim() ?? 'last name'
          }));

          const promises = [];
          let totalSuccessForInvite = 0;

          users?.forEach((it) => {
            promises.push(createUserByAdmin(organizationId, it));
          });
          if (promises?.length > 0) {
            Promise.allSettled(promises)
              .then((items) => {
                items.forEach((item, index) => {
                  if (item.status === 'fulfilled') {
                    totalSuccessForInvite++;
                  } else {
                    console.error('creating user failed', item.reason?.response?.data);
                    if (item?.reason?.response?.data?.status?.toString() === '409') {
                      props.showErrorNotification(
                        props.t('msg user email conflicts', {
                          email: users[index]?.email
                        })
                      );
                    }
                  }
                });
              })
              .finally(() => {
                if (totalSuccessForInvite > 0) {
                  setStatus({ visibleModal: true });
                  props.showSuccessNotification(
                    props.t(
                      totalSuccessForInvite
                        ? 'msg users created success'
                        : 'msg user created success',
                      {
                        numberOfSuccess: totalSuccessForInvite
                      }
                    )
                  );
                }
                initialize();
                setLoading(false);
              });
          } else {
            initialize();
            setLoading(false);
          }
        } catch (e) {
          console.log('update company error', e);
          props.showErrorNotification(e.response?.data?.message);
          setLoading(false);
        }
      }
    } else {
      if (values?.companyName?.created) {
        // if selected already created company
        navigate(`/invite/${values?.companyName?.value}/team-mode`);
      } else {
        try {
          setLoading(true);
          const apiRes = await createCompany(data);
          const companyData = apiRes.data;
          isSuperAdmin
            ? navigate(`/invite/${companyData?.id}/representative`)
            : navigate(`/invite/${companyData?.id}/team-mode`);
        } catch (e) {
          console.log('creating company error', e);
          props.showErrorNotification(e.response?.data?.message);
        } finally {
          setLoading(false);
        }
      }
    }
  }
})(FormCompany);

const mapStateToProps = (state) => ({
  allOrganizations: get(state, 'base.allOrganizations')
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      setRestBarClass: setRestBarClassAction,
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction,
      queryAllOrganizations: queryAllOrganizationsAction
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(EnhancedForm));
