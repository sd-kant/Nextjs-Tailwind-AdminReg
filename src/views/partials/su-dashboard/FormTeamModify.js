import React, { useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Form, withFormik } from 'formik';
import { bindActionCreators } from 'redux';
import CreatableSelect from 'react-select/creatable';
import { useNavigate } from 'react-router-dom';
import {
  setLoadingAction,
  setRestBarClassAction,
  showErrorNotificationAction
} from '../../../redux/action/ui';
import { queryAllTeamsAction } from '../../../redux/action/base';
import { get } from 'lodash';
import { customStyles } from './FormCompany';
import backIcon from '../../../assets/images/back.svg';
import ResponsiveSelect from '../../components/ResponsiveSelect';
import { getUsersUnderOrganization, queryTeamMembers, removeTeam, updateTeam } from '../../../http';
import { useOrganizationContext } from '../../../providers/OrganizationProvider';
import { INVALID_VALUES1 } from '../../../constant';
import countryRegions from 'country-region-data/data.json';
import ConfirmModal from '../../components/ConfirmModal';
import ConfirmModalV2 from '../../components/ConfirmModalV2';
import { checkIfSpacesOnly } from '../../../utils/invite';

const formSchema = (t) => {
  return Yup.object().shape({
    name: Yup.object()
      .shape({
        label: Yup.string()
          .test('is-valid', t('team name required'), function (value) {
            return !checkIfSpacesOnly(value);
          })
          .test('is-valid', t('team name min error'), function (value) {
            return value?.trim()?.length >= 6;
          })
          .required(t('team name required'))
          .min(6, t('team name min error'))
          .max(1024, t('team name max error'))
      })
      .required(t('team name required')),
    country: Yup.object()
      .shape({
        label: Yup.string()
      })
      .test('is-valid', t('team country required'), function (value) {
        return this.parent.editing ? !!value?.label : true;
      }),
    region: Yup.object()
      .shape({
        label: Yup.string()
      })
      .test('is-valid', t('team region required'), function (value) {
        return this.parent.editing ? !!value?.label : true;
      }),
    location: Yup.object()
      .shape({
        label: Yup.string()
          .min(2, t('team location min error'))
          .max(1024, t('team location max error'))
      })
      .test('is-valid', t('team location required'), function (value) {
        return this.parent.editing ? !!value?.label : true;
      }),
    editing: Yup.boolean()
  });
};

const FormTeamModify = (props) => {
  const {
    values,
    errors,
    touched,
    t,
    allTeams,
    setRestBarClass,
    setFieldValue,
    queryAllTeams,
    organizationId,
    isAdmin,
    showErrorNotification,
    setLoading
  } = props;
  const [hasUnassignedMember, setHasUnassignedMember] = React.useState(false);

  const [visibleDeleteTeamModal, setVisibleDeleteTeamModal] = React.useState(false);
  const [visibleDeleteTeamSuccessModal, setVisibleDeleteTeamSuccessModal] = React.useState(false);

  const { locations, organization } = useOrganizationContext();

  const navigate = useNavigate();

  useEffect(() => {
    setRestBarClass('progress-54 medical');
    queryAllTeams();
    if (isAdmin) {
      unAssignedUsersUnderOrganization();
    } else {
      setHasUnassignedMember(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeHandler = (key, value) => {
    setFieldValue(key, value);
  };

  const options = useMemo(
    () =>
      countryRegions
        ?.filter((it) => organization?.country?.split('@').includes(it.countryName))
        ?.map((it) => ({
          label: it.countryName,
          value: it.countryShortCode
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [countryRegions, organization]
  );

  const regions = React.useMemo(() => {
    let ret = [];
    if (values?.country) {
      ret = countryRegions.find((it) => values?.country?.label === it.countryName)?.regions;
    }

    return ret.map((it) => ({
      label: it.name,
      value: it.shortCode
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values?.country]);

  React.useEffect(() => {
    if (values.name?.value) {
      setFieldValue('country', options.find((it) => it.label === values.name?.country) ?? '');
      setFieldValue('region', regions?.find((it) => it.label === values.name?.region) ?? '');
      setFieldValue('location', locations?.find((it) => it.label === values.name?.location) ?? '');
    }
    setFieldValue('editing', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.name?.value]);

  React.useEffect(() => {
    if (values.name?.region) {
      setFieldValue(
        'region',
        regions?.find((it) => it.label === values.name?.region)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regions]);

  const unAssignedUsersUnderOrganization = () => {
    getUsersUnderOrganization({ userType: 'unassigned', organizationId })
      .then((res) => {
        const hasUnassignedMember = res.data?.some(
          (ele) => !(ele.teamId || ele?.teams?.length > 0)
        );
        setHasUnassignedMember(hasUnassignedMember);
      })
      .catch((err) => {
        showErrorNotification(err?.response?.data?.message);
      })
      .finally(() => {});
  };

  const filteredTeams = React.useMemo(() => {
    let teams = [];
    allTeams?.forEach((team) => {
      if (
        INVALID_VALUES1.includes(organizationId?.toString()) ||
        team.orgId?.toString() === organizationId?.toString()
      ) {
        teams.push({
          value: team.id,
          label: team.name,
          country: team.country,
          location: team.location,
          region: team.region,
          orgId: team.orgId
        });
      }
    });
    hasUnassignedMember &&
      teams.push({
        value: -1,
        label: t('no team assigned')?.toUpperCase()
      });
    return teams;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTeams, hasUnassignedMember]);

  const handleNameChange = (e) => {
    setFieldValue('name', {
      ...values.name,
      label: e.target.value
    });
  };

  const handleCancel = () => {
    setFieldValue('editing', false);
    const team = filteredTeams.find(
      (it) => it.value?.toString() === values.name?.value?.toString()
    );
    setFieldValue('name', team);
  };

  const changes = React.useMemo(() => {
    const team = filteredTeams.find(
      (it) => it.value?.toString() === values.name?.value?.toString()
    );
    const ret = [];
    if (team) {
      if (values.name?.label?.trim() !== team?.label?.trim()) {
        ret.push('name');
      }
      if (values.region?.label?.trim() !== team?.region?.trim()) {
        ret.push('region');
      }
      if (values.location?.label?.trim() !== team?.location?.trim()) {
        ret.push('location');
      }
      if (values.country?.label?.trim() !== team?.country?.trim()) {
        ret.push('country');
      }
    }

    return ret;
  }, [values, filteredTeams]);

  const handleWarningOk = () => {
    if (!values?.name?.value || !isAdmin) {
      setVisibleDeleteTeamModal(false);
      return null;
    } else {
      setLoading(true);
      removeTeam(values.name.value)
        .then(() => {
          setVisibleDeleteTeamModal(false);
          setVisibleDeleteTeamSuccessModal(true);
        })
        .catch((err) => {
          showErrorNotification(err?.response?.data?.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleConfirmOk = () => {
    setVisibleDeleteTeamSuccessModal(false);
    queryAllTeams();
    setFieldValue('name', '');
    setFieldValue('country', '');
    setFieldValue('location', '');
    setFieldValue('region', '');
    setFieldValue('editing', false);
  };

  return (
    <>
      <ConfirmModal
        show={visibleDeleteTeamSuccessModal}
        header={t('team delete success')}
        onOk={handleConfirmOk}
      />
      <ConfirmModalV2
        show={visibleDeleteTeamModal}
        header={t('remove team')}
        onOk={handleWarningOk}
        onCancel={() => setVisibleDeleteTeamModal(false)}
      />

      <Form className="form mt-57">
        <div>
          <div
            className="d-inline-flex align-center cursor-pointer"
            onClick={() => navigate(`/invite/${isAdmin ? organizationId : -1}/team-mode`)}
          >
            <img src={backIcon} alt="back" />
            &nbsp;&nbsp;
            <span className="font-button-label text-orange">{t('previous')}</span>
          </div>

          <div className="grouped-form mt-40">
            <label className="font-header-medium">{t('team modify description')}</label>
          </div>

          <div className="d-flex flex-column mt-40">
            {values?.editing ? (
              <React.Fragment>
                <input
                  className="input input-field mt-10 font-heading-small text-white"
                  value={values.name?.label}
                  type="text"
                  onChange={handleNameChange}
                />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <ResponsiveSelect
                  className="mt-10 font-heading-small text-black input-field"
                  isClearable
                  options={filteredTeams}
                  value={values['name']}
                  name="name"
                  styles={customStyles()}
                  placeholder={t('team name select')}
                  menuPortalTarget={document.body}
                  menuPosition={'fixed'}
                  onChange={(value) => changeHandler('name', value)}
                />
              </React.Fragment>
            )}
            {touched?.name && errors?.name && (
              <span className="font-helper-text text-error mt-10">{errors.name.label}</span>
            )}
          </div>
          {!INVALID_VALUES1.includes(values.name?.value) ? (
            values?.editing ? (
              <React.Fragment>
                <div className="mt-40 d-flex flex-column">
                  <label className="font-input-label">{t('company country')}</label>

                  <div className="mt-10 input-field">
                    <ResponsiveSelect
                      className="mt-10 font-heading-small text-black input-field"
                      options={options}
                      value={values['country']}
                      name="country"
                      styles={customStyles()}
                      onChange={(value) => setFieldValue('country', value)}
                      menuPortalTarget={document.body}
                      menuPosition={'fixed'}
                      placeholder={t('select')}
                    />
                  </div>

                  {touched.country && errors.country && (
                    <span className="font-helper-text text-error mt-10">{errors.country}</span>
                  )}
                </div>

                <div className="d-flex flex-column mt-40">
                  <span className="font-input-label">{t('team region')}</span>
                  <ResponsiveSelect
                    className="mt-10 font-heading-small text-black input-field"
                    options={regions}
                    value={values['region']}
                    name="region"
                    styles={customStyles()}
                    menuPortalTarget={document.body}
                    menuPosition={'fixed'}
                    onChange={(v) => setFieldValue('region', v)}
                  />
                  {touched.region && errors.region && (
                    <span className="font-helper-text text-error mt-10">{errors.region}</span>
                  )}
                </div>

                <div className="d-flex flex-column mt-40">
                  <label className="font-input-label">{t('team location')}</label>
                  <CreatableSelect
                    className="mt-10 font-heading-small text-black input-field"
                    options={locations}
                    value={values['location']}
                    name="location"
                    styles={customStyles()}
                    placeholder={t('enter location')}
                    onChange={(v) => setFieldValue('location', v)}
                  />
                  {touched?.location && errors?.location && (
                    <span className="font-helper-text text-error mt-10">{errors.location}</span>
                  )}
                </div>
              </React.Fragment>
            ) : (
              <div className="d-flex mt-25">
                <label
                  className="text-capitalize text-orange cursor-pointer"
                  onClick={() => setFieldValue('editing', true)}
                >
                  {t('edit')}
                </label>
                {isAdmin && (
                  <label
                    className="text-capitalize text-orange cursor-pointer ml-20"
                    onClick={() => setVisibleDeleteTeamModal(true)}
                  >
                    {t('delete')}
                  </label>
                )}
              </div>
            )
          ) : null}
        </div>

        <div className="mt-80">
          {values.editing ? (
            <button
              className={`button ${
                values['name'] && changes?.length > 0
                  ? 'active cursor-pointer'
                  : 'inactive cursor-default'
              }`}
              type={values['name'] && changes?.length > 0 ? 'submit' : 'button'}
            >
              <span className="font-button-label text-white text-uppercase">{t('save')}</span>
            </button>
          ) : (
            <button
              className={`button ${
                values['name'] ? 'active cursor-pointer' : 'inactive cursor-default'
              }`}
              type={values['name'] ? 'submit' : 'button'}
            >
              <span className="font-button-label text-white text-uppercase">{t('next')}</span>
            </button>
          )}
          {!INVALID_VALUES1.includes(values.name?.value) && values.editing && (
            <button
              className={`button cursor-pointer cancel ml-15`}
              type={'button'}
              onClick={handleCancel}
            >
              <span className="font-button-label text-orange text-uppercase">{t('cancel')}</span>
            </button>
          )}
        </div>
      </Form>
    </>
  );
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    name: '',
    country: '',
    location: '',
    region: '',
    editing: false
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: async (values, { props, setFieldValue }) => {
    const teamId = values?.name?.value;
    const { setLoading, showErrorNotification } = props;
    const { organizationId, navigate } = props;

    if (teamId?.toString() === '-1') {
      // if selected "no team assigned"
      navigate(`/invite/${organizationId}/edit/modify/-1`);
    } else {
      try {
        setLoading(true);

        if (values?.editing) {
          await updateTeam(teamId, {
            orgId: values.name?.orgId,
            name: values.name?.label,
            country: values.country?.label,
            region: values.region?.label,
            location: values.location?.label
          });
          setFieldValue('editing', false);
          props.queryAllTeams();
        } else {
          const teamMembersResponse = await queryTeamMembers(teamId);
          let teamMembers = teamMembersResponse?.data?.members;
          const { allTeams } = props;
          const team = allTeams.find((it) => it.id?.toString() === values?.name?.value?.toString());
          if (teamMembers?.length > 0 && team) {
            navigate(`/invite/${team.orgId}/edit/modify/${team.id}`);
          } else {
            navigate(`/invite/${team.orgId}/edit/manual/${team.id}`);
          }
        }
      } catch (e) {
        showErrorNotification(e.response?.data?.message);
      } finally {
        setLoading(false);
      }
    }
  }
})(FormTeamModify);

const mapStateToProps = (state) => ({
  allTeams: get(state, 'base.allTeams'),
  isAdmin: get(state, 'auth.isAdmin')
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      setRestBarClass: setRestBarClassAction,
      showErrorNotification: showErrorNotificationAction,
      queryAllTeams: queryAllTeamsAction
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(EnhancedForm));
