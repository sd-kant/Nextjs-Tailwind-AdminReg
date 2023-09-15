import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Form, withFormik } from 'formik';
import { bindActionCreators } from 'redux';
import { setLoadingAction, setRestBarClassAction } from 'redux/action/ui';
import { USER_TYPE_ORG_ADMIN, USER_TYPE_ADMIN } from 'constant';
import { queryAllOrganizationsAction } from 'redux/action/base';
import { get } from 'lodash';
import clsx from 'clsx';
import style from './FormCompanySelect.module.scss';
import ResponsiveSelect from 'views/components/ResponsiveSelect';
import { useNavigate } from 'react-router-dom';
import { customStyles } from '../../FormCompany';

const formSchema = (t) => {
  return Yup.object().shape({
    companyName: Yup.object().required(t('company name required'))
  });
};

const FormCompanySelect = (props) => {
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
    isSuperAdmin
  } = props;
  const navigate = useNavigate();
  useEffect(() => {
    setRestBarClass('progress-0 medical');
    queryAllOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [organizations, setOrganizations] = useState([]);
  const changeHandler = (key, value) => {
    setFieldValue(key, value);
  };

  useEffect(() => {
    setOrganizations(
      (allOrganizations &&
        allOrganizations.map((organization) => ({
          value: organization.id,
          label: organization.name
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

  const handleCancel = () => {
    navigate('/select-mode');
  };

  return (
    <React.Fragment>
      <Form className="form mt-57">
        <div className={clsx(style.TopWrapper)}>
          <div className="grouped-form">
            <label className="font-header-medium">
              {isSuperAdmin ? t('select company') : t('welcome')}
            </label>
          </div>

          <div className="d-flex flex-column mt-40">
            <label className="font-input-label">{t('company name')}</label>
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
            {touched.companyName && errors.companyName && (
              <span className="font-helper-text text-error mt-10">{errors.companyName?.label}</span>
            )}
          </div>
        </div>
        <div className="mt-80">
          <button className={'button active cursor-pointer'} type={'submit'}>
            <span className="font-button-label text-white text-uppercase">{t('next')}</span>
          </button>
          <button
            className={clsx(style.CancelBtn, `button cursor-pointer cancel`)}
            type={'button'}
            onClick={handleCancel}>
            <span className="font-button-label text-orange text-uppercase">{t('cancel')}</span>
          </button>
        </div>
      </Form>
    </React.Fragment>
  );
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    companyName: ''
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: async (values, { props }) => {
    const { navigate } = props;
    navigate(`/connect/member/${values?.companyName?.value}/method`);
  }
})(FormCompanySelect);

const mapStateToProps = (state) => ({
  allOrganizations: get(state, 'base.allOrganizations'),
  userType: get(state, 'auth.userType'),
  isSuperAdmin: get(state, 'auth.userType')?.includes(USER_TYPE_ADMIN),
  isOrgAdmin: get(state, 'auth.userType')?.includes(USER_TYPE_ORG_ADMIN)
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      setRestBarClass: setRestBarClassAction,
      queryAllOrganizations: queryAllOrganizationsAction
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(EnhancedForm));
