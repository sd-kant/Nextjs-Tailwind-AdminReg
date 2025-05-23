import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Yup from 'yup';
import { Form, useFormikContext, withFormik } from 'formik';
import { Trans, withTranslation } from 'react-i18next';
import searchIcon from 'assets/images/search.svg';
import {
  setLoadingAction,
  setRestBarClassAction,
  setVisibleSuccessModalAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from 'redux/action/ui';
import { queryAllTeamsAction } from 'redux/action/base';
import { get } from 'lodash';
import SearchUserItem from '../../SearchUserItem';
import ConfirmModal from 'views/components/ConfirmModal';
import { useMembersContext } from 'providers/MembersProvider';
import { useNavigate } from 'react-router-dom';
import { handleModifyUsers, checkIfSpacesOnly } from 'utils/invite';
import { ScrollToFieldError } from 'views/components/ScrollToFieldError';
import style from './FormSearch.module.scss';
import clsx from 'clsx';
import { getParamFromUrl } from 'utils';
import PreviousButton from 'views/components/PreviousButton';

export const defaultTeamMember = {
  email: '',
  firstName: '',
  lastName: '',
  job: '',
  action: 1,
  phoneNumber: null
};

export const userSchema = (t) => {
  return Yup.object()
    .shape({
      email: Yup.string().email(t('email invalid')).max(1024, t('email max error')),
      // .test('required', t('unable to remove email'), function (value) {
      //   if (value) return true;
      //   return !!this.parent.phoneNumber?.value;
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
      job: Yup.object().required(t('role required')),
      phoneNumber: Yup.object()
    })
    .required();
};

const formSchema = (t) => {
  return Yup.object().shape({
    users: Yup.array().of(userSchema(t))
  });
};

let intervalForChangesDetect;

const FormSearch = (props) => {
  const {
    values,
    errors,
    touched,
    t,
    setFieldValue,
    setRestBarClass,
    status,
    setStatus,
    isAdmin,
    organizationId
  } = props;
  const [newChanges, setNewChanges] = useState(0);
  const { users, setPage, keyword, setKeyword, apiLoading } = useMembersContext();
  const navigate = useNavigate();
  const { submitForm } = useFormikContext();

  useEffect(() => {
    setRestBarClass('progress-72 medical');
    countChanges();
    setPage('search');
    const keyword = getParamFromUrl('keyword');
    if (keyword) {
      setKeyword(keyword);
    }
    setFieldValue('users', users);
    return () => {
      clearInterval(intervalForChangesDetect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*useEffect(() => {
    if (!loading) {
      setVisibleDeleteModal(false);
    }
  }, [loading]);*/

  useEffect(() => {
    setFieldValue('users', users);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  const countChanges = () => {
    intervalForChangesDetect = setInterval(() => {
      const items = document.getElementsByClassName('exist-when-updated');
      setNewChanges(items?.length ?? 0);
    }, 500);
  };
  const visibleSubmitBtn = React.useMemo(() => {
    return newChanges > 0;
  }, [newChanges]);

  return (
    <>
      <ConfirmModal
        show={status?.visibleSuccessModal}
        header={t('modify team success header')}
        onOk={() => {
          setStatus({ visibleSuccessModal: false });
          window.location.reload();
        }}
      />
      <Form className="form-group mt-57">
        <div>
          <div className="tw-flex">
            <PreviousButton
              onClick={() => navigate(`/invite/${isAdmin ? organizationId : -1}/team-mode`)}>
              {t('previous')}
            </PreviousButton>
          </div>

          <div className={clsx(style.FormHeader, 'mt-40 d-flex flex-column')}>
            <ScrollToFieldError />
            <div className={clsx(style.Header)}>
              <div className={clsx('d-flex align-center', style.Title)}>
                <span className="font-header-medium d-block text-capitalize">{t('search')}</span>
              </div>

              <div />

              <div className={clsx(style.NoteWrapper)}>
                <div className={clsx('d-flex align-center', style.ChangeNote)}>
                  <span>
                    <Trans
                      i18nKey={
                        newChanges === 0
                        ? 'no new change'
                        : newChanges > 1
                          ? 'new changes'
                          : 'new change'}
                      values={{ numberOfChanges: newChanges }}
                      components={{
                        a: (
                          <span
                            className={'text-approval-green'}
                          />
                        )
                      }}
                    />
                  </span>
                </div>
                {visibleSubmitBtn && (
                  <div className={clsx(style.SaveIconWrapper)}>
                    <span
                      className="text-orange font-input-label text-uppercase"
                      onClick={submitForm}>
                      {t('save')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className={clsx(style.Tools)}>
              <div className={clsx(style.SearchWrapper)}>
                <img className={clsx(style.SearchIcon)} src={searchIcon} alt="search icon" />
                <input
                  className={clsx(style.SearchInput, 'input mt-10 font-heading-small text-white')}
                  placeholder={t('search user')}
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              {visibleSubmitBtn ? (
                <div className={clsx(style.SubmitWrapper)}>
                  <button className={`button active cursor-pointer`} type={'submit'}>
                    <span className="font-button-label text-white">{t('save & update')}</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className={clsx(style.FormBody, 'mt-40 d-flex flex-column')}>
            {values?.users?.length > 0 ? (
              values?.users?.map((user, index) => (
                <SearchUserItem
                  user={user}
                  index={index}
                  key={`user-${index}`}
                  id={`users.${index}`}
                  errorField={errors?.users}
                  touchField={touched?.users}
                />
              ))
            ) : (
              <div className={clsx(style.Info)}>
                {apiLoading ? <span>{t('loading')}</span> : <span>{t('no matches found')}</span>}
              </div>
            )}
          </div>
        </div>
      </Form>
    </>
  );
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    users: [defaultTeamMember]
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: async (values, { props, setStatus }) => {
    const {
      showErrorNotification,
      showSuccessNotification,
      setLoading,
      t,
      isAdmin,
      organizationId
    } = props;
    // filter users that were modified to update
    let users = (values?.users ?? [])?.filter((it) => it.updated);
    await handleModifyUsers({
      setLoading,
      users,
      organizationId,
      isAdmin,
      setStatus,
      showErrorNotification,
      showSuccessNotification,
      t
    });
  },
  enableReinitialize: true
})(FormSearch);

const mapStateToProps = (state) => ({
  allTeams: get(state, 'base.allTeams'),
  loading: get(state, 'ui.loading'),
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
      showSuccessNotification: showSuccessNotificationAction,
      queryAllTeams: queryAllTeamsAction
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(EnhancedForm));
