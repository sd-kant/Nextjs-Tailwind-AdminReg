import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {bindActionCreators} from "redux";
import history from "../../../history";
import {setLoadingAction, setRestBarClassAction, showErrorNotificationAction} from "../../../redux/action/ui";
import {queryAllTeamsAction} from "../../../redux/action/base";
import {get} from "lodash";
import {customStyles} from "./FormCompany";
import backIcon from "../../../assets/images/back.svg";
import ResponsiveSelect from "../../components/ResponsiveSelect";
import {getUsersUnderOrganization, queryTeamMembers, updateTeam} from "../../../http";
import {useOrganizationContext} from "../../../providers/OrganizationProvider";
import CreatableSelect from "react-select/creatable/dist/react-select.esm";

const formSchema = (t) => {
  return Yup.object().shape({
    name: Yup.object()
      .shape({
        label: Yup.string()
          .required(t('team name required'))
      })
      .nullable()
      .required(t('team name required')),
    region: Yup.object(),
    location: Yup.object()
      .shape({
        label: Yup.string()
          .min(2, t('team location min error'))
          .max(1024, t('team location max error')),
      }),
    editing: Yup.boolean(),
  });
};

const FormTeamModify = (props) => {
  const {values, errors, touched, t, allTeams, setRestBarClass, setFieldValue, queryAllTeams, match: {params: {organizationId}}, isAdmin, showErrorNotification,} = props;
  const [hasUnassignedMember, setHasUnassignedMember] = React.useState(false);
  const {regions, locations} = useOrganizationContext();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setRestBarClass("progress-54 medical");
    queryAllTeams();
    setMounted(true);
    if (isAdmin) {
      unAssignedUsersUnderOrganization();
    } else {
      setHasUnassignedMember(false);
    }
    return () => setMounted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeHandler = (key, value) => {
    setFieldValue(key, value);
  }

  React.useEffect(() => {
    if (values.name?.value) {
      setFieldValue("region", regions?.find(it => it.label === values.name?.region));
      setFieldValue("location", locations?.find(it => it.label === values.name?.location));
    }
    setFieldValue("editing", false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.name?.value]);

  const unAssignedUsersUnderOrganization = () => {
    getUsersUnderOrganization({userType: 'unassigned', organizationId})
      .then(res => {
        const hasUnassignedMember = res.data?.some(ele => !(ele.teamId || ele?.teams?.length > 0));
        if (mounted) setHasUnassignedMember(hasUnassignedMember);
      })
      .catch(err => {
        showErrorNotification(err?.response?.data?.message ?? t("msg something went wrong"));
      })
      .finally(() => {

      });
  }

  const filteredTeams = React.useMemo(() => {
    let teams = [];
    allTeams?.forEach(team => {
      if (
        [undefined, "-1", null, ""].includes(organizationId?.toString()) ||
        team.orgId?.toString() === organizationId?.toString()
      ) {
        teams.push({
          value: team.id,
          label: team.name,
          location: team.location,
          region: team.region,
          orgId: team.orgId,
        });
      }
    });
    hasUnassignedMember && teams.push({
      value: -1,
      label: t("no team assigned")?.toUpperCase(),
    });
    return teams;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTeams, hasUnassignedMember]);

  const navigateTo = (path) => {
    history.push(path);
  }

  return (
    <Form className='form mt-57'>
      <div>
        <div
          className="d-inline-flex align-center cursor-pointer"
          onClick={() => navigateTo(`/invite/${isAdmin ? organizationId : -1}/team-mode`)}
        >
          <img src={backIcon} alt="back"/>
          &nbsp;&nbsp;
          <span className='font-button-label text-orange'>
              {t("previous")}
            </span>
        </div>

        <div className='grouped-form mt-40'>
          <label className="font-header-medium">
            {t("team modify description")}
          </label>
        </div>

        <div className='d-flex flex-column mt-40'>
          <ResponsiveSelect
            className='mt-10 font-heading-small text-black input-field'
            isClearable
            options={filteredTeams}
            value={values["name"]}
            name="name"
            styles={customStyles()}
            placeholder={t("team name select")}
            menuPortalTarget={document.body}
            menuPosition={'fixed'}
            onChange={(value) => changeHandler("name", value)}
          />

          {
            touched?.name && errors?.name && (
              <span className="font-helper-text text-error mt-10">{errors.name.label}</span>
            )
          }
        </div>
        {
          !([null, undefined, -1, ""].includes(values.name?.value)) ? (
            values?.editing ?
              <React.Fragment>
                <div className='d-flex flex-column mt-40'>
                  <span className='font-input-label'>
                    {t("team region")}
                  </span>
                  <ResponsiveSelect
                    className='mt-10 font-heading-small text-black input-field'
                    options={regions}
                    value={values["region"]}
                    name="region"
                    styles={customStyles()}
                    menuPortalTarget={document.body}
                    menuPosition={'fixed'}
                    onChange={v => setFieldValue("region", v)}
                  />
                  {
                    touched.region && errors.region && (
                      <span className="font-helper-text text-error mt-10">{errors.region?.label}</span>
                    )
                  }
                </div>

                <div className='d-flex flex-column mt-40'>
                  <label className='font-input-label'>
                    {t("team location")}
                  </label>
                  <CreatableSelect
                    className='mt-10 font-heading-small text-black input-field'
                    isClearable
                    options={locations}
                    value={values["location"]}
                    name="location"
                    styles={customStyles()}
                    menuPortalTarget={document.body}
                    menuPosition={'fixed'}
                    placeholder={t("enter location")}
                    onChange={v => setFieldValue("location", v)}
                  />
                  {
                    touched?.location && errors?.location && (
                      <span className="font-helper-text text-error mt-10">{errors.location?.label}</span>
                    )
                  }
                </div>
              </React.Fragment> :
              <div className='d-flex mt-25'>
                <label
                  className='text-capitalize text-orange cursor-pointer'
                  onClick={() => setFieldValue("editing", true)}
                >
                  {t("edit location")}
                </label>
              </div>
          ) : null
        }
      </div>

      <div className='mt-80'>
        <button
          className={`button ${values['name'] ? "active cursor-pointer" : "inactive cursor-default"}`}
          type={values['name'] ? "submit" : "button"}
        >
          <span className='font-button-label text-white text-uppercase'>
            {values.editing ? t("save") : t("next")}
          </span>
        </button>
        {
          !([null, undefined, -1, ""].includes(values.name?.value)) && values.editing && (
            <button
              className={`button cursor-pointer cancel ml-15`}
              type={"button"}
              onClick={() => setFieldValue("editing", false)}
            >
            <span className='font-button-label text-orange text-uppercase'>
              {t("cancel")}
            </span>
            </button>
          )
        }
      </div>
    </Form>
  )
}

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    name: '',
    location: '',
    region: '',
    editing: false,
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props, setFieldValue}) => {
    const teamId = values?.name?.value;
    if (teamId?.toString() === "-1") { // if selected "no team assigned"
      const {match: {params: {organizationId}}} = props;
      history.push(`/invite/${organizationId}/edit/modify/-1`);
    } else {
      const {setLoading, showErrorNotification} = props;
      try {
        setLoading(true);

        if (values?.editing) {
          await updateTeam(teamId, {
            orgId: values.name?.orgId,
            name: values.name?.label,
            region: values.region?.label,
            location: values.location?.label,
          });
          setFieldValue("editing", false);
          props.queryAllTeams();
        } else {
          const teamMembersResponse = await queryTeamMembers(teamId);
          let teamMembers = teamMembersResponse?.data?.members;
          const {allTeams} = props;
          const team = allTeams.find(it => it.id?.toString() === values?.name?.value?.toString());
          if (teamMembers?.length > 0 && team) {
            history.push(`/invite/${team.orgId}/edit/modify/${team.id}`);
          } else {
            history.push(`/invite/${team.orgId}/edit/manual/${team.id}`);
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
  isAdmin: get(state, 'auth.isAdmin'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      setRestBarClass: setRestBarClassAction,
      showErrorNotification: showErrorNotificationAction,
      queryAllTeams: queryAllTeamsAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));