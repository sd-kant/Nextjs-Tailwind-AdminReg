import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Yup from 'yup';
import { Form, withFormik, useFormikContext } from 'formik';
import { Trans, withTranslation } from 'react-i18next';
import plusIcon from 'assets/images/plus-circle-fire.svg';
import searchIcon from 'assets/images/search.svg';
import uploadIcon from 'assets/images/upload-fire.svg';
import {
  setLoadingAction,
  setRestBarClassAction,
  setVisibleSuccessModalAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from 'redux/action/ui';
import { INVALID_VALUES1, permissionLevels } from 'constant';
import { deleteUserAction, queryAllTeamsAction } from 'redux/action/base';
import { get } from 'lodash';
import SearchUserItem from '../../SearchUserItem';
import ConfirmModal from 'views/components/ConfirmModal';
import AddMemberModalV2 from 'views/components/AddMemberModalV2';
import InviteModal from '../../modify/InviteModal';
import { useMembersContext } from 'providers/MembersProvider';
import { useNavigate } from 'react-router-dom';
import { defaultTeamMember, userSchema } from '../team-search/FormSearch';
import { _handleSubmitV2, handleModifyUsers } from 'utils/invite';
import { ScrollToFieldError } from 'views/components/ScrollToFieldError';
import style from './FormInviteModify.module.scss';
import clsx from 'clsx';
import PreviousButton from 'views/components/PreviousButton';

const formSchema = (t) => {
  return Yup.object().shape({
    users: Yup.array().of(userSchema(t)),
    admins: Yup.array().of(userSchema(t))
  });
};

let intervalForChangesDetect;

const FormInviteModify = (props) => {
  const {
    values,
    errors,
    touched,
    t,
    id,
    organizationId,
    setLoading,
    showErrorNotification,
    setRestBarClass,
    status,
    setStatus,
    setValues,
    isAdmin
  } = props;
  const [newChanges, setNewChanges] = useState(0);
  const [visibleAddModal, setVisibleAddModal] = useState(false);
  const [visibleAddMemberSuccessModal, setVisibleAddMemberSuccessModal] = useState(false);
  const [addMemberSuccessResult, setAddMemberSuccessResult] = useState([]);
  const {
    apiLoading,
    setPage,
    users,
    admins,
    keyword,
    setKeyword,
    members,
    initializeMembers,
    teams
  } = useMembersContext();
  const navigate = useNavigate();
  const [visibleInviteModal, setVisibleInviteModal] = React.useState(false);
  const { submitForm } = useFormikContext();

  useEffect(() => {
    setRestBarClass('progress-72 medical');
    setPage('modify');
    countChanges();
    setValues({
      users,
      admins
    });

    return () => {
      clearInterval(intervalForChangesDetect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countChanges = () => {
    intervalForChangesDetect = setInterval(() => {
      const items = document.getElementsByClassName('exist-when-updated');
      setNewChanges(items?.length ?? 0);
    }, 500);
  };

  useEffect(() => {
    setValues({
      users,
      admins
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, admins]);

  const addAnother = () => {
    setVisibleInviteModal(true);
  };

  const addHandler = async (user) => {
    if (!id) {
      return;
    }
    if (user.email) {
      const alreadyExist = members?.findIndex((it) => it.email === user.email) !== -1;
      if (alreadyExist) {
        showErrorNotification(t('error member with same email address'));
        return;
      }
    }
    // fixme check if phone number conflicts under the team

    try {
      setLoading(true);
      const users = [user];
      if (INVALID_VALUES1.includes(organizationId?.toString())) {
        navigate('/invite/company');
        return;
      }
      const { numberOfSuccess, alreadyRegisteredUsers, succeedRegisteredUsers } =
        await _handleSubmitV2({
          users,
          setLoading,
          organizationId,
          teamId: id,
          showErrorNotification,
          isAdmin,
          t
        });
      initializeMembers();
      if (numberOfSuccess === 1) {
        setAddMemberSuccessResult([
          {
            alreadyRegisteredUsers,
            succeedRegisteredUsers
          }
        ]);
        setVisibleAddModal(false);
        setVisibleAddMemberSuccessModal(true);
      }
    } catch (e) {
      console.log('_handleSubmit error', e);
    } finally {
      setLoading(false);
    }
  };

  const visibleAddBtn = React.useMemo(() => {
    return !['-1'].includes(id?.toString());
  }, [id]);
  const visibleSubmitBtn = React.useMemo(() => {
    return newChanges > 0;
  }, [newChanges]);

  const teamName = React.useMemo(() => {
    return (teams || []).find((it) => it.value?.toString() === id?.toString())?.label ?? '';
  }, [id, teams]);

  const getSuccessMessageForInvite = () => {
    if (addMemberSuccessResult?.length > 0) {
      if (
        addMemberSuccessResult[0].succeedRegisteredUsers[0]?.email ||
        addMemberSuccessResult[0].succeedRegisteredUsers[0]?.phoneNumber
      ) {
        return t('new team member added description 2');
      } else if (addMemberSuccessResult[0].succeedRegisteredUsers[0]?.registrationCode) {
        return t('new team member added description 2 without pin');
      }
    }
    return '';
  };

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
      <ConfirmModal
        show={visibleAddMemberSuccessModal}
        data={addMemberSuccessResult}
        header={t('new team member added header')}
        subheader={getSuccessMessageForInvite()}
        onOk={() => {
          setVisibleAddMemberSuccessModal(false);
        }}
        cancelText={t('add a team member')}
        onCancel={() => {
          setVisibleAddMemberSuccessModal(false);
          setVisibleAddModal(true);
        }}
      />
      <AddMemberModalV2
        isOpen={visibleAddModal}
        permissionLevels={permissionLevels}
        onAdd={addHandler}
        onClose={() => {
          setVisibleAddModal(false);
        }}
      />
      <InviteModal
        isOpen={visibleInviteModal}
        onClose={() => setVisibleInviteModal(false)}
        onClickCreate={() => {
          setVisibleInviteModal(false);
          setVisibleAddModal(true);
        }}
      />
      <Form className="form-group mt-57">
        <div>
          <div className="tw-flex">
            <PreviousButton onClick={() => navigate(`/invite/${organizationId}/team-modify`)}>
              {t('previous')}
            </PreviousButton>
          </div>

          <div className={clsx(style.FormHeader, 'd-flex flex-column')}>
            <ScrollToFieldError />
            <div className={clsx(style.Header)}>
              <div className={clsx('d-flex align-center', style.Title)}>
                <span className="font-header-medium d-block">
                  {t('modify')} {teamName}
                </span>
              </div>
              <div />

              <div className={clsx(style.NoteWrapper)}>
                <div className={clsx('align-center', style.ChangeNote)}>
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
                  className={clsx(style.SearchInput, 'input mt-10 text-white')}
                  placeholder={t('search user')}
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              {visibleAddBtn && (
                <div className={clsx(style.AddIconWrapper, 'tw-justify-center tw-gap-[8px]')}>
                  <img
                    className={clsx(style.AddIcon)}
                    src={plusIcon}
                    alt="save icon"
                    onClick={addAnother}
                  />
                  <img
                    className={clsx(style.AddIcon)}
                    src={uploadIcon}
                    alt="upload icon"
                    onClick={() => navigate(`/invite/${organizationId}/upload/${id}`)}
                  />
                </div>
              )}

              {visibleSubmitBtn && (
                <div className={clsx(style.SubmitWrapper)}>
                  <button className={`button active cursor-pointer`} type={'submit'}>
                    <span className="font-button-label text-white">{t('save & update')}</span>
                  </button>
                </div>
              )}
            </div>

            {visibleAddBtn && (
              <div className={clsx(style.AddButton_Space, 'mt-15')}>
                <div className={clsx(style.AddButton)} onClick={addAnother}>
                  <img src={plusIcon} className={clsx(style.PlusIcon)} alt="plus icon" />
                  <span className="font-heading-small text-capitalize">
                    {t('add a team member')}
                  </span>
                </div>
                <div className={clsx(style.AddButton)} onClick={() => navigate(`/invite/${organizationId}/upload/${id}`)}>
                  <img src={uploadIcon} className={clsx(style.PlusIcon)} alt="upload icon" />
                  <span className="font-heading-small text-capitalize">
                    {t('bulk upload')}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className={clsx(style.FormBody, 'd-flex flex-column')}>
            {values?.users?.length > 0 && (
              <div className="mt-28">
                <span className="font-heading-small text-uppercase text-orange">
                  {t('operators')}
                </span>
              </div>
            )}

            {values?.users?.map((user, index) => (
              <SearchUserItem
                user={user}
                index={index}
                key={`user-${index}`}
                id={`users.${index}`}
                errorField={errors?.users}
                touchField={touched?.users}
              />
            ))}

            {values?.admins?.length > 0 && (
              <div className="mt-28">
                <span className="font-heading-small text-uppercase text-orange">
                  {t('administrators')}
                </span>
              </div>
            )}

            {values?.admins?.map((user, index) => (
              <SearchUserItem
                user={user}
                index={index}
                key={`admin-${index}`}
                id={`admins.${index}`}
                errorField={errors?.admins}
                touchField={touched?.admins}
              />
            ))}

            {values?.users?.length === 0 &&
              values?.admins?.length === 0 &&
              (apiLoading ? (
                <div className={clsx(style.Info)}>
                  <span>{t('loading')}</span>
                </div>
              ) : (
                <div className={clsx(style.Info)}>
                  <span>{t('no matches found')}</span>
                </div>
              ))}
          </div>
        </div>
      </Form>
    </>
  );
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    users: [defaultTeamMember],
    admins: [defaultTeamMember]
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: async (values, { props, setStatus }) => {
    const {
      showErrorNotification,
      showSuccessNotification,
      setLoading,
      t,
      organizationId,
      isAdmin
    } = props;
    // filter users that were modified to update
    let users = [...(values?.users ?? []), ...(values?.admins ?? [])]?.filter((it) => it.updated);
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
})(FormInviteModify);

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
      queryAllTeams: queryAllTeamsAction,
      deleteUser: deleteUserAction
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(EnhancedForm));
