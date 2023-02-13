import React, {useEffect, useMemo} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {
  Form,
  withFormik
} from "formik";
import {bindActionCreators} from "redux";
import {
  createTeam,
  getCompanyById
} from "../../../http";
import {
  setLoadingAction,
  setRestBarClassAction,
  showErrorNotificationAction
} from "../../../redux/action/ui";
import backIcon from "../../../assets/images/back.svg";
import {get} from "lodash";
import ResponsiveSelect from "../../components/ResponsiveSelect";
import countryRegions from 'country-region-data/data.json';
import {customStyles} from "./FormCompany";
import CreatableSelect from "react-select/creatable";
import {useNavigate} from "react-router-dom";
import {INVALID_VALUES1} from "../../../constant";
import {checkIfSpacesOnly} from "../../../utils/invite";

const formSchema = (t) => {
  return Yup.object().shape({
    name: Yup.string()
      .test(
          'is-valid',
          t('team name required'),
          function (value) {
            return !checkIfSpacesOnly(value);
          }
      )
      .test(
          'is-valid',
          t('team name min error'),
          function (value) {
            return value?.trim()?.length >= 6;
          }
      )
      .required(t('team name required'))
      .min(6, t('team name min error'))
      .max(1024, t('team name max error')),
    country: Yup.object()
        .required(t('company country required')),
    region: Yup.object()
      /*.required(t('region required'))*/,
    location: Yup.object()
      .shape({
        label: Yup.string()
          .min(2, t('team location min error'))
          .max(1024, t('team location max error')),
      }),
  });
};

const FormTeamCreate = (props) => {
  const {values, errors, touched, t, setRestBarClass, setFieldValue, isAdmin, organizationId} = props;
  const [organization, setOrganization] = React.useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setRestBarClass("progress-54 medical");
    getCompanyById(organizationId)
      .then(response => {
        setOrganization(response.data);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeFormField = (e) => {
    const {value, name} = e.target;

    setFieldValue(name, value);
  };
  const options = useMemo(() =>
          countryRegions?.filter(it => organization?.country?.split("@").includes(it.countryName))?.map(it => ({label: it.countryName, value: it.countryShortCode})),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [countryRegions, organization]
  );

  const regions = React.useMemo(() => {
    let ret = [];
    if (values?.country) {
      ret = countryRegions.find(it => values?.country?.label === it.countryName)?.regions;
    }
    return ret.map(it => ({
      label: it.name,
      value: it.shortCode,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values?.country]);

  const locations = React.useMemo(() => {
    return organization?.locations?.map((it, index) => ({
      label: it,
      value: `${index}-${it}`,
    })) ?? [];
  }, [organization]);

  return (
    <Form className='form mt-57'>
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigate(`/invite/${isAdmin ? organizationId : -1}/team-mode`)}
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
            placeholder={t("enter team name")}
            onChange={changeFormField}
          />

          {
            touched?.name && errors?.name && (
              <span className="font-helper-text text-error mt-10">{errors.name}</span>
            )
          }
        </div>

        <div className='mt-40 d-flex flex-column'>
          <label className='font-input-label'>
            {t("company country")}
          </label>

          <div className='mt-10 input-field'>
            <ResponsiveSelect
              className='mt-10 font-heading-small text-black input-field'
              options={options}
              value={values["country"]}
              name="country"
              styles={customStyles()}
              onChange={(value) => setFieldValue("country", value)}
              menuPortalTarget={document.body}
              menuPosition={'fixed'}
              placeholder={t("select")}
            />
          </div>

          {
            touched.country && errors.country && (
                <span className="font-helper-text text-error mt-10">{errors.country}</span>
            )
          }
        </div>

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
            placeholder={t("enter location")}
            onChange={v => setFieldValue("location", v)}
          />
          {
            touched?.location && errors?.location && (
              <span className="font-helper-text text-error mt-10">{errors.location?.label}</span>
            )
          }
        </div>

        {/*<div className='grouped-form mt-40'>
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
        </div>*/}
      </div>

      <div className='mt-80'>
        <button
          className={`button active cursor-pointer`}
          type={"submit"}
        >
          <span className='font-button-label text-white'>
            {t("next")}
          </span>
        </button>
      </div>
    </Form>
  )
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    name: '',
    country: '',
    location: '',
    region: '',
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props}) => {
    const {organizationId: orgId, navigate} = props;
    if (INVALID_VALUES1.includes(orgId?.toString())) {
      navigate("/invite/company");
      return;
    }
    const data = {
      orgId: parseInt(orgId),
      name: values?.name?.trim() ?? 'team name',
      country: values?.country?.label,
      location: values?.location?.label,
      region: values?.region?.label,
    };

    try {
      props.setLoading(true);
      const apiRes = await createTeam(data);
      const teamData = apiRes.data;
      navigate(`/invite/${teamData?.orgId}/select/${teamData?.id}`);
    } catch (e) {
      console.log("creating team error", e);
      props.showErrorNotification((e.response?.data?.validationErrors?.filter(it => it?.messageCode === "error.team.duplicateName")?.length > 0) ? props.t("team already exist") : e.response?.data?.message);
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