import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {bindActionCreators} from "redux";
import history from "../../../history";
import {createTeam} from "../../../http";
import {setLoadingAction, setRestBarClassAction, showErrorNotificationAction} from "../../../redux/action/ui";
import {queryAllTeamsAction} from "../../../redux/action/base";
import {get} from "lodash";
import CreatableSelect from "react-select/creatable/dist/react-select.esm";
import {customStyles} from "./FormCompany";
import backIcon from "../../../assets/images/back.svg";
import {checkIfSuperAdmin} from "../../pages/Invite";

const formSchema = (t) => {
  return Yup.object().shape({
    name: Yup.object()
      .shape({
        label: Yup.string()
          .required(t('team name required'))
          .min(6, t('team name min error'))
          .max(1024, t('team name max error')),
      })
      .nullable()
      .required(t('team name required')),
    location: Yup.string()
      .required(t('team location required'))
      .min(2, t('team location min error'))
      .max(1024, t('team location max error')),
  });
};

const FormTeam = (props) => {
  const {values, errors, touched, t, allTeams, setRestBarClass, setFieldValue, queryAllTeams} = props;

  useEffect(() => {
    setRestBarClass("progress-54 medical");
    queryAllTeams();
  }, []);

  const changeFormField = (e) => {
    const {value, name} = e.target;

    setFieldValue(name, value);
  }

  const changeHandler = (key, value) => {
    if (key === "name") {
      if (value && value.created) { // if already created team, then set location according to picked team
        setFieldValue("location", value.location);
      }
    }
    setFieldValue(key, value);
  }

  const formatTeams = () => {
    return (allTeams && allTeams.map(team => ({
      value: team.id,
      label: team.name,
      location: team.location,
      created: true,
    }))) || [];
  }

  const navigateTo = (path) => {
    history.push(path);
  }

  return (
    <Form className='form mt-57'>
      <div>
        <div
          className="d-flex align-center cursor-pointer"
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
            {t("create or select team")}
          </label>

          <label className="font-binary d-block mt-8">
            {t("create or select team description")}
          </label>
        </div>

        <div className='d-flex flex-column mt-40'>
          <label className='font-input-label'>
            {t("team name")}
          </label>

          {/*<input
            className='input input-field mt-10 font-heading-small text-white'
            name="name"
            value={values["name"]}
            type='text'
            onChange={changeFormField}
          />*/}

          <CreatableSelect
            className='mt-10 font-heading-small text-black input-field'
            isClearable
            options={formatTeams()}
            value={values["name"]}
            name="name"
            styles={customStyles}
            placeholder={t("enter name")}
            onChange={(value) => changeHandler("name", value)}
          />

          {
            touched?.name && errors?.name && (
              <span className="font-helper-text text-error mt-10">{errors.name.label}</span>
            )
          }
        </div>

        <div className='grouped-form mt-40'>
          <label className='font-input-label'>
            {t("team location")}
          </label>

          <input
            className='input input-field mt-10 font-heading-small text-white'
            name="location"
            value={values["location"]}
            type='text'
            onChange={changeFormField}
          />

          {
            touched?.location && errors?.location && (
              <span className="font-helper-text text-error mt-10">{errors.location}</span>
            )
          }
        </div>
      </div>

      <div className='mt-80'>
        <button
          className={`button ${values['name'] && values["location"] ? "active cursor-pointer" : "inactive cursor-default"}`}
          type={values['name'] && values["location"] ? "submit" : "button"}
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
    location: '',
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props}) => {
    const isSuperAdmin = checkIfSuperAdmin(props.email);

    if (values?.name?.created) {
      localStorage.setItem("kop-team-id", values?.name?.value);
      // if (isSuperAdmin)
      //   history.push("/invite/representative");
      // else
      history.push("/invite/select");
    } else {
      const data = {
        ...values,
        name: values?.name?.label,
        measure: 2,
      };

      try {
        props.setLoading(true);
        const apiRes = await createTeam(data);
        const responseData = apiRes.data;

        if (responseData?.status !== 200) {
          props.showErrorNotification(responseData?.msg);
        } else {
          // store created company id in local storage, so that we can use it when inviting users
          const teamData = responseData?.data;
          localStorage.setItem("kop-team-id", teamData?.id);
          // if (isSuperAdmin)
          //   history.push("/invite/representative");
          // else
          history.push("/invite/select");
        }
      } catch (e) {
        console.log("creating team error", e);
        props.showErrorNotification(props.t("msg something went wrong"));
      } finally {
        props.setLoading(false);
      }
    }
  }
})(FormTeam);

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