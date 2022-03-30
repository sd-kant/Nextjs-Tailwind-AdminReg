import React, {useState, useEffect} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {withTranslation} from "react-i18next";
import history from "../../../history";
import backIcon from "../../../assets/images/back.svg";
import plusIcon from "../../../assets/images/plus-circle-fire.svg";
import searchIcon from "../../../assets/images/search.svg";
import {
  setLoadingAction,
  setRestBarClassAction,
  setVisibleSuccessModalAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from "../../../redux/action/ui";
import {
  inviteTeamMember,
  updateUserByAdmin,
} from "../../../http";
import {
  lowercaseEmail,
} from "./FormRepresentative";
import style from "./FormInviteModify.module.scss";
import clsx from "clsx";
import {_handleSubmit} from "./FormInvite";
import {
  permissionLevels,
} from "../../../constant";
import {
  deleteUserAction,
  queryAllTeamsAction,
} from "../../../redux/action/base";
import {get, isEqual} from "lodash";
import ConfirmModal from "../../components/ConfirmModal";
import AddMemberModalV2 from "../../components/AddMemberModalV2";
import {useMembersContext} from "../../../providers/MembersProvider";
import SearchUserItem from "./SearchUserItem";
import {formatJob, setUserType, userSchema} from "./FormSearch";

export const defaultTeamMember = {
  email: '',
  firstName: '',
  lastName: '',
  job: "",
  action: 1,
};

const formSchema = (t) => {
  return Yup.object().shape({
    users: Yup.array().of(
      userSchema(t),
    ),
    admins: Yup.array().of(
      userSchema(t),
    ),
  });
};

let intervalForChangesDetect;

const FormInviteModify = (props) => {
  const {
    values,
    errors,
    touched,
    t,
    match: {params: {id, organizationId}},
    setLoading,
    setFieldValue,
    showErrorNotification,
    showSuccessNotification,
    setRestBarClass,
    status,
    setStatus,
  } = props;
  const [newChanges, setNewChanges] = useState(0);
  const [visibleAddModal, setVisibleAddModal] = useState(false);
  const [inviteMode, setInviteMode] = useState("invite-only"); // invite-only, register-invite
  const [visibleAddMemberSuccessModal, setVisibleAddMemberSuccessModal] = useState(false);
  const {setPage, users, admins, keyword, setKeyword, members, initializeMembers} = useMembersContext();

  useEffect(() => {
    setRestBarClass("progress-72 medical");
    setPage("modify");
    countChanges();

    return () => {
      clearInterval(intervalForChangesDetect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countChanges = () => {
    intervalForChangesDetect = setInterval(() => {
      const items = document.getElementsByClassName("exist-when-updated");
      setNewChanges(items?.length ?? 0);
    }, 500);
  };

  useEffect(() => {
    setFieldValue("users", users);
    setFieldValue("admins", admins);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, admins]);


  const navigateTo = (path) => {
    history.push(path);
  };

  const addAnother = () => {
    setVisibleAddModal(true);
  };

  const goBack = () => {
    navigateTo(`/invite/${organizationId}/team-modify`);
  };

  const addHandler = async user => {
    if (!id) {
      return;
    }
    const alreadyExist = members?.findIndex(it => it.email === user.email) !== -1;
    if (alreadyExist) {
      showErrorNotification(
        '',
        t('error member with same email address'),
      );
      return;
    }

    if (inviteMode === 'invite-only') {
      try {
        setLoading(true);
        const inviteResponse = await inviteTeamMember(id, {
          add: [
            {
              email: user.email,
              userTypes: [user.permissionLevel?.value?.toString() === "1" ? "TeamAdmin" : "Operator"],
            },
          ],
        });
        if (inviteResponse?.data?.added?.length !== 1) {
          setInviteMode('register-invite');
        } else {
          initializeMembers();
          setVisibleAddModal(false);
          setVisibleAddMemberSuccessModal(true);
        }
      } catch (e) {
        showErrorNotification(e.response?.data?.message)
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        const users = [{
          ...user,
          job: user.jobRole,
          userType: user.permissionLevel,
        }];
        if ([undefined, "-1", null, ""].includes(organizationId?.toString())) {
          history.push("/invite/company");
          return;
        }
        const {numberOfSuccess} =
          await _handleSubmit({
            users,
            setLoading,
            showSuccessNotification,
            organizationId,
            teamId: id,
            t,
          });
        initializeMembers();
        if (numberOfSuccess === 1) {
          setVisibleAddModal(false);
          setVisibleAddMemberSuccessModal(true);
        }
      } catch (e) {
        console.log('_handleSubmit error', e);
      } finally {
        setLoading(false);
      }
    }
  };


  return (
    <>
      <ConfirmModal
        show={status?.visibleSuccessModal}
        header={t('modify team success header')}
        onOk={() => {
          setStatus({visibleSuccessModal: false});
          window.location.reload();
        }}
      />
      <ConfirmModal
        show={visibleAddMemberSuccessModal}
        header={t('new team member added header')}
        subheader={inviteMode !== 'invite-only' ? t('new team member added description') : null}
        onOk={() => {
          setInviteMode('invite-only');
          setVisibleAddMemberSuccessModal(false);
        }}
        cancelText={t('add another member')}
        onCancel={() => {
          setInviteMode('invite-only');
          setVisibleAddMemberSuccessModal(false);
          setVisibleAddModal(true);
        }}
      />
      <AddMemberModalV2
        inviteOnly={inviteMode === 'invite-only'}
        isOpen={visibleAddModal}
        permissionLevels={permissionLevels}
        onAdd={addHandler}
        onClose={() => {
          setInviteMode('invite-only');
          setVisibleAddModal(false);
        }}
      />
      <Form className='form-group mt-57'>
        <div>
          <div className="d-flex align-center">
            <img src={backIcon} alt="back" className={"cursor-pointer"} onClick={() => goBack()}/>
            &nbsp;&nbsp;
            <span className='font-button-label text-orange cursor-pointer' onClick={() => goBack()}>
              {t("previous")}
            </span>
          </div>

          <div className={clsx(style.FormHeader, "mt-40 d-flex flex-column")}>
            <div className={clsx(style.Header)}>
              <div className={"d-flex align-center"}>
              <span className='font-header-medium d-block'>
              {t("modify team")}
              </span>
              </div>

              <div/>

              <div className={clsx("d-flex align-center", style.ChangeNote)}>
              <span className="font-header-medium">
                {t(newChanges === 0 ? 'no new change' : (newChanges > 1 ? 'new changes' : 'new change'), {numberOfChanges: newChanges})}
              </span>
              </div>
            </div>

            <div className={clsx(style.SearchWrapper)}>
              <img className={clsx(style.SearchIcon)} src={searchIcon} alt="search icon"/>
              <input
                className={clsx(style.SearchInput, 'input mt-10 font-heading-small text-white')}
                placeholder={t("search user")}
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
          </div>

          <div className={clsx(style.FormBody, "mt-40 d-flex flex-column")}>
            {
              !(["-1"].includes(id?.toString())) &&
              <div className={clsx(style.AddButton, "mt-28")} onClick={addAnother}>
                <img src={plusIcon} className={clsx(style.PlusIcon)} alt="plus icon"/>
                <span className="font-heading-small text-capitalize">
                  {t("add another member")}
                </span>
              </div>
            }

            {
              values?.users?.length > 0 &&
              <div className="mt-28">
              <span className="font-heading-small text-uppercase text-orange">
                {t("operators")}
              </span>
              </div>
            }

            {
              values?.users?.map((user, index) => (
                <SearchUserItem
                  user={user}
                  index={index}
                  key={`user-${index}`}
                  errorField={errors?.users}
                  touchField={touched?.users}
                />
              ))
            }

            {
              values?.admins?.length > 0 &&
              <div className="mt-28">
              <span className="font-heading-small text-uppercase text-orange">
                {t("administrators")}
              </span>
              </div>
            }

            {
              values?.admins?.map((user, index) => (
                <SearchUserItem
                  user={user}
                  index={index}
                  key={`admin-${index}`}
                  errorField={errors?.admins}
                  touchField={touched?.admins}
                />
              ))
            }

          </div>
        </div>
        {
          newChanges ?
            <div className={clsx(style.Footer)}>
              <button
                className={`button active cursor-pointer`}
                type={"submit"}
              >
                <span className='font-button-label text-white'>
                  {t("save & update")}
                </span>
              </button>
            </div> : <></>
        }
      </Form>
    </>
  )
}

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    users: [defaultTeamMember],
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props, setStatus}) => {
    const {
      showErrorNotification,
      showSuccessNotification,
      setLoading,
      t,
      match: {params: {organizationId}},
      isAdmin,
    } = props;
    // filter users that were modified to update
    let users = ([...(values?.users ?? []), ...(values?.admins ?? [])])?.filter(it => it.updated);
    // fixme optimize
    try {
      setLoading(true);
      let usersToModify = [];
      users?.forEach(it => {
        if (it.userId) {
          usersToModify.push(it);
        }
      });
      usersToModify = setUserType(formatJob(lowercaseEmail(usersToModify)));
      usersToModify = usersToModify?.map(it => ({
        userId: it.userId,
        firstName: it.firstName,
        lastName: it.lastName,
        job: it.job,
        email: it.email,
        userType: it.userType,
        accessibleTeams: it.accessibleTeams,
        originalAccessibleTeams: it.originalAccessibleTeams,
      }));

      if (usersToModify?.length > 0) {
        const updatePromises = [];
        let inviteBody = {};
        usersToModify?.forEach(userToModify => {
          if (!([undefined, "-1", null, ""].includes(organizationId?.toString()))) {
            if (isAdmin) {
              updatePromises.push(updateUserByAdmin(organizationId, userToModify.userId, userToModify));
            }
            userToModify?.originalAccessibleTeams?.forEach(originalAccessibleTeam => {
              const isRemoved = !(userToModify?.accessibleTeams?.some(accessibleTeam => accessibleTeam.teamId?.toString() === originalAccessibleTeam.teamId?.toString()));
              if (isRemoved) {
                if (inviteBody[originalAccessibleTeam.teamId]?.remove) {
                  inviteBody[originalAccessibleTeam.teamId].remove.push(userToModify?.email);
                } else {
                  inviteBody[originalAccessibleTeam.teamId] = {remove: [userToModify?.email]};
                }
              }
            });
            userToModify?.accessibleTeams?.forEach(accessibleTeam => {
              if (accessibleTeam.teamId && accessibleTeam.userTypes?.length > 0) {
                // check if this is new change
                const origin = userToModify?.originalAccessibleTeams?.find(item => item.teamId?.toString() === accessibleTeam?.teamId?.toString());
                if (!isEqual(origin?.userTypes?.sort(), accessibleTeam?.userTypes?.sort())) {
                  if (inviteBody[accessibleTeam.teamId]?.add) {
                    inviteBody[accessibleTeam.teamId].add.push({
                      email: userToModify?.email,
                      userTypes: accessibleTeam?.userTypes,
                    });
                  } else {
                    inviteBody[accessibleTeam.teamId] = {
                      add: [
                        {
                          email: userToModify?.email,
                          userTypes: accessibleTeam?.userTypes,
                        }
                      ],
                    };
                  }
                }
              }
            });
          }
        });
        const failedEmails = [];
        let totalSuccessForModify = 0;

        const inviteFunc = () => {
          const invitePromises = [];
          if (inviteBody) {
            Object.keys(inviteBody).forEach((teamId, index) => {
              invitePromises.push(inviteTeamMember(teamId, Object.values(inviteBody)?.[index]));
            });
          }

          if (invitePromises?.length > 0) {
            Promise.allSettled(invitePromises)
              .finally(() => {
                if (failedEmails?.length === 0) {
                  setStatus({visibleSuccessModal: true});
                }
                setLoading(false);
              });
          } else {
            setStatus({visibleSuccessModal: true});
            setLoading(false);
          }
        };

        if (updatePromises?.length > 0) {
          Promise.allSettled(updatePromises)
            .then((results) => {
              results?.forEach((result, index) => {
                if (result.status === "fulfilled") {
                  totalSuccessForModify++;
                } else {
                  // store failed emails
                  failedEmails.push(usersToModify[index]?.email);
                  showErrorNotification(result.reason?.response?.data?.message);
                  console.log("modifying team member failed", result.reason);
                }
              });

              if (totalSuccessForModify > 0) {
                showSuccessNotification(
                  t(totalSuccessForModify > 1 ? 'msg users modified success' : 'msg user modified success', {
                    numberOfUsers: totalSuccessForModify,
                  })
                );
              }
            })
            .finally(async () => {
              // finished promise
              inviteFunc();
            });
        } else {
          inviteFunc();
        }
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.log('_handleSubmit error', e);
    }
  }
})(FormInviteModify);

const mapStateToProps = (state) => ({
  allTeams: get(state, 'base.allTeams'),
  loading: get(state, 'ui.loading'),
  userType: get(state, 'auth.userType'),
  isAdmin: get(state, 'auth.isAdmin'),
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
      deleteUser: deleteUserAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));