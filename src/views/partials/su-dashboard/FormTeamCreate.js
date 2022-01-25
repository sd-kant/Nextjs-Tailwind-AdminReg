import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {bindActionCreators} from "redux";
import history from "../../../history";
import {createTeam} from "../../../http";
import {setLoadingAction, setRestBarClassAction, showErrorNotificationAction} from "../../../redux/action/ui";
import backIcon from "../../../assets/images/back.svg";
import {get} from "lodash";

const formSchema = (t) => {
  return Yup.object().shape({
    name: Yup.string()
      .required(t('team name required'))
      .min(6, t('team name min error'))
      .max(1024, t('team name max error')),
    location: Yup.string()
      .required(t('team location required'))
      .min(2, t('team location min error'))
      .max(1024, t('team location max error')),
  });
};

const FormTeamCreate = (props) => {
  const {values, errors, touched, t, setRestBarClass, setFieldValue, match: {params: {organizationId}}, isAdmin,} = props;

  useEffect(() => {
    setRestBarClass("progress-54 medical");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeFormField = (e) => {
    const {value, name} = e.target;

    setFieldValue(name, value);
  }

  const navigateTo = (path) => {
    history.push(path);
  }

  return (
    <Form className='form mt-57'>
      <div>
        <div
          className="d-flex align-center cursor-pointer"
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
            {t("create team")}
          </label>

          <label className="font-binary d-block mt-8">
            {t("create or select team description")}
          </label>
        </div>

        <div className='d-flex flex-column mt-40'>
          <label className='font-input-label'>
            {t("team name")}
          </label>

          <input
            className='input input-field mt-10 font-heading-small text-white'
            name="name"
            value={values["name"]}
            type='text'
            onChange={changeFormField}
          />

          {
            touched?.name && errors?.name && (
              <span className="font-helper-text text-error mt-10">{errors.name}</span>
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
    const { match: {params: {organizationId: orgId}}} = props;
    if (["undefined", "-1", "null", ""].includes(orgId?.toString())) {
      history.push("/invite/company");
      return;
    }
    const data = {
      orgId: parseInt(orgId),
      name: values?.name,
      location: values?.location,
    };

    try {
      props.setLoading(true);
      const apiRes = await createTeam(data);
      const teamData = apiRes.data;
      history.push(`/invite/${teamData?.orgId}/select/${teamData?.id}`);
    } catch (e) {
      console.log("creating team error", e);
      props.showErrorNotification(e.response?.data?.message ?? props.t("msg something went wrong"));
    } finally {
      props.setLoading(false);
    }
  }
})(FormTeamCreate);

const mapStateToProps = (state) => ({
  isAdmin: get(state, 'auth.isAdmin'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      setRestBarClass: setRestBarClassAction,
      showErrorNotification: showErrorNotificationAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));