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
import {queryTeamMembers} from "../../../http";

const formSchema = (t) => {
  return Yup.object().shape({
    name: Yup.object()
      .shape({
        label: Yup.string()
          .required(t('team name required'))
      })
      .nullable()
      .required(t('team name required')),
  });
};

const FormTeamModify = (props) => {
  const {values, errors, touched, t, allTeams, setRestBarClass, setFieldValue, queryAllTeams} = props;

  useEffect(() => {
    setRestBarClass("progress-54 medical");
    queryAllTeams();
  }, []);

  const changeHandler = (key, value) => {
    setFieldValue(key, value);
  }

  const formatTeams = () => {
    return (allTeams && allTeams.map(team => ({
      value: team.id,
      label: team.name,
      location: team.location,
    }))) || [];
  }

  const navigateTo = (path) => {
    history.push(path);
  }

  return (
    <Form className='form mt-57'>
      <div>
        <div
          className="d-inline-flex align-center cursor-pointer"
          onClick={() => navigateTo('/invite/team-mode')}
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
            options={formatTeams()}
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
      </div>

      <div className='mt-80'>
        <button
          className={`button ${values['name'] ? "active cursor-pointer" : "inactive cursor-default"}`}
          type={values['name'] ? "submit" : "button"}
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
    name: '',
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props}) => {
    if (values?.name?.value) {
      const {setLoading, showErrorNotification} = props;
      try {
        setLoading(true);
        const teamMembersResponse = await queryTeamMembers(values?.name?.value);
        let teamMembers = teamMembersResponse?.data?.members;
        if (teamMembers?.length > 0) {
          history.push(`/invite/edit/modify/${values?.name?.value}`);
        } else {
          const {allTeams} = props;
          const team = allTeams.find(it => it.id?.toString() === values?.name?.value?.toString());
          if (team) {
            localStorage.setItem("kop-v2-picked-organization-id", team.orgId);
            localStorage.setItem("kop-v2-team-id", team.id);
            history.push(`/invite/edit/manual`);
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