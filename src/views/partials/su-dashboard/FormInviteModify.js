import React, {useState, useEffect, useMemo} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {withTranslation} from "react-i18next";
import history from "../../../history";
import backIcon from "../../../assets/images/back.svg";
import plusIcon from "../../../assets/images/plus-circle-fire.svg";
import removeIcon from "../../../assets/images/remove.svg";
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
import Select from "react-select";
import {_handleSubmit, customStyles} from "./FormInvite";
import {AVAILABLE_JOBS, defaultPassword, permissionLevels} from "../../../constant";
import {
  deleteUserAction,
  queryAllTeamsAction,
  removeTeamMemberAction,
} from "../../../redux/action/base";
import {queryTeamMembers as queryTeamMembersAPI} from "../../../http";
import {get} from "lodash";
import ConfirmModalV2 from "../../components/ConfirmModalV2";
import ConfirmModal from "../../components/ConfirmModal";
import AddMemberModalV2 from "../../components/AddMemberModalV2";

export const defaultTeamMember = {
  email: '',
  firstName: '',
  lastName: '',
  permissionLevel: [],
  job: "",
  team: "",
};

const loadTeamMembers = async (id, showErrorNotification, setFieldValue, initializeTemp = false) => {
  if (id) {
    try {
      const teamMembersResponse = await queryTeamMembersAPI(id);
      let teamMembers = teamMembersResponse?.data?.members;
      teamMembers.forEach((item, index) => {
        item['index'] = index;
      });
      teamMembers?.sort((a, b) => {
        return a?.lastName?.localeCompare(b?.lastName);
      });
      setFieldValue("teamMembers", teamMembers);
      if (initializeTemp) {
        setFieldValue("tempTeamMembers", teamMembers);
      }
    } catch (e) {
      showErrorNotification(e?.response?.data?.message);
    }
  }
  return [];
};

const userSchema = (t) => {
  return Yup.object().shape({
    email: Yup.string()
      .required(t('email required'))
      .email(t("email invalid"))
      .max(1024, t('email max error')),
    firstName: Yup.string()
      .required(t('firstName required'))
      .max(1024, t("firstName max error")),
    lastName: Yup.string()
      .required(t('lastName required'))
      .max(1024, t("lastName max error")),
    permissionLevel: Yup.array()
      .min(1, t('role required'))
      .required(t('role required')),
    job: Yup.object()
      .required(t('role required')),
    team: Yup.object()
      .shape({
        label: Yup.string()
          .required(t('team name required'))
      })
      .nullable()
      .required(t('team name required')),
  }).required();
}

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
    match,
    loading,
    setLoading,
    setFieldValue,
    showErrorNotification,
    showSuccessNotification,
    allTeams,
    queryAllTeams,
    setRestBarClass,
    status,
    setStatus,
    deleteUser: deleteAction,
  } = props;
  const id = match?.params?.id;
  const [keyword, setKeyword] = useState('');
  const [newChanges, setNewChanges] = useState(0);
  const [visibleDeleteModal, setVisibleDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [visibleAddModal, setVisibleAddModal] = useState(false);
  const [inviteMode, setInviteMode] = useState("invite-only"); // invite-only, register-invite
  const [visibleAddMemberSuccessModal, setVisibleAddMemberSuccessModal] = useState(false);

  useEffect(() => {
    setRestBarClass("progress-72 medical");
    if (id) {
      loadTeamMembers(id, showErrorNotification, setFieldValue, true).catch(e => console.log(e));
    }
    loadAllTeams();
    countChanges();

    return () => {
      clearInterval(intervalForChangesDetect);
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      setVisibleDeleteModal(false);
    }
  }, [loading]);

  const countChanges = () => {
    intervalForChangesDetect = setInterval(() => {
      const items = document.getElementsByClassName("exist-when-updated");
      setNewChanges(items?.length ?? 0);
    }, 500);
  };

  useEffect(() => {
    let users = [];
    let admins = [];

    values?.["tempTeamMembers"]?.forEach((it, index) => {
      let fitOnKeyword = false;
      if (keyword && keyword.trim() !== '') {
        const trimmedKeyword = keyword.trim().toLowerCase();
        if (
          it.firstName?.toLowerCase()?.includes(trimmedKeyword) ||
          it.lastName?.toLowerCase()?.includes(trimmedKeyword) ||
          it.email?.toLowerCase()?.includes(trimmedKeyword)
        ) {
          fitOnKeyword = true;
        }
      } else {
        fitOnKeyword = true;
      }

      if (fitOnKeyword) {
        const item = {
          ...formatForFormValue(it),
          originIndex: index,
        };
        const updated = isUpdated(item);
        if (item?.userTypes?.includes("TeamAdmin")) { // admins
          admins.push({
            ...item,
            updated,
          })
        } else {
          users.push({
            ...item,
            updated,
          });
        }
      }
    });

    setFieldValue("users", users);
    setFieldValue("admins", admins);
  }, [values["teamMembers"], values?.["tempTeamMembers"], allTeams, keyword]);

  const formatForFormValue = (it) => {
    const roleMap = {
      "1": "TeamAdmin",
      "2": "Operator",
    };
    return {
      userId: it.userId,
      firstName: it.firstName,
      lastName: it.lastName,
      email: it.email,
      job: sortedJobs?.find(ele => ele.value?.toString() === (it?.job?.toString() ?? "14")),
      // fixme role name
      permissionLevel: permissionLevels?.filter(ele => it?.userTypes.includes(roleMap[ele.value?.toString()])),
      userTypes: it.userTypes,
      team: formattedTeams?.find(ele => ele.value?.toString() === (it?.teamId ?? id)?.toString()),
      index: it.index,
    }
  };

  const loadAllTeams = () => {
    queryAllTeams();
  };

  const navigateTo = (path) => {
    history.push(path);
  };

  const sortedJobs = AVAILABLE_JOBS && AVAILABLE_JOBS.sort((a, b) => {
    return a.label > b.label ? 1 : -1;
  });

  const formattedTeams = useMemo(() => {
    return (allTeams && allTeams.map(team => ({
      value: team.id,
      label: team.name,
    }))) || [];
  }, [allTeams]);

  const addAnother = () => {
    setVisibleAddModal(true);
  };

  const goBack = () => {
    navigateTo('/invite/team-modify');
  };

  const deleteUser = () => {
    if (selectedUser) {
      if (selectedUser?.userId) {
        deleteAction(selectedUser.userId);
      }
    }
  };

  const _handleChange = (value, index, key) => {
    const temp = (values?.["tempTeamMembers"] && JSON.parse(JSON.stringify(values?.["tempTeamMembers"]))) ?? [];
    temp[index][key] = value;
    setFieldValue("tempTeamMembers", temp);
  };

  const _handleChangeForTeamUserType = (value, index) => {
    const temp = (values?.["tempTeamMembers"] && JSON.parse(JSON.stringify(values?.["tempTeamMembers"]))) ?? [];
    temp[index]["userTypes"] = value?.map(it => it.value?.toString() === "1" ? "TeamAdmin" : "Operator");
    setFieldValue("tempTeamMembers", temp);
  };

  const isUpdated = (user) => {
    const origins = values?.["teamMembers"]?.filter(it => it.index === user.index) ?? [];
    if (origins?.length > 0) {
      const keysInOrigin = ["firstName", "lastName", "email", "userTypes"];
      const keys = ["firstName", "lastName", "email", "userTypes"];
      let shouldSkip = false;
      let ret = false;
      origins?.forEach(origin => {
        ret = false;
        if (shouldSkip) {
          return;
        }
        keys.forEach((key, index) => {
          const valueInUser = get(user, key);
          const valueInOrigin = get(origin, keysInOrigin[index]);
          if (valueInUser?.toString() !== valueInOrigin?.toString()) {
            ret = true;
          }
        });
        // No Role Defined will be selected as default when user's job role is null, and this will not be considered as updated
        if (get(user, "job.value") !== get(origin, "job")) {
          if (!(get(user, "job.value") === "14" && [null, undefined, ""].includes(get(origin, "job")))) {
            ret = true;
          }
        }
        if (get(user, "team.value")?.toString() !== id?.toString()) {
          ret = true;
        }
        if (ret === false) {
          shouldSkip = true;
        }
      });

      return ret;
    } else { // if item is newly added
      return true;
    }
  };

  const addHandler = async user => {
    if (!id) {
      return;
    }
    const alreadyExist = values?.teamMembers?.findIndex(it => it.email === user.email) !== -1;
    if (alreadyExist) {
      showErrorNotification(
        '',
        t('team has same email user'),
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
          loadTeamMembers(id, showErrorNotification, setFieldValue, true).catch(e => console.log(e));
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
        // const organizationId = localStorage.getItem("kop-v2-picked-organization-id");
        const organizationId = allTeams?.find(it => it?.id?.toString() === id?.toString())?.orgId;
        if (!organizationId) {
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
        loadTeamMembers(id, showErrorNotification, setFieldValue, true).catch(e => console.log(e));
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

  const reset = (user) => {
    const temp = JSON.parse(JSON.stringify(values?.["tempTeamMembers"] ?? []));
    if (typeof user.originIndex === 'number' && user.originIndex !== -1) {
      if (!(user?.userId)) { // if newly added
        temp?.splice(user.originIndex, 1);
      } else {
        const origin = values?.["teamMembers"].find(it => it.userId === user.userId);
        temp?.splice(user.originIndex, 1, origin);
      }
      setFieldValue("tempTeamMembers", temp?.sort((a, b) => a?.lastName?.localeCompare(b?.lastName)));
    }
  };

  const renderUser = (user, index, key) => {
    let errorField = errors?.users;
    let touchField = touched?.users;
    if (key === 'admin') {
      errorField = errors?.admins;
      touchField = touched?.admins;
    }
    return (
      <div className={clsx(style.User)} key={`${key}-${index}`}>
        <div className={clsx(style.RemoveIconWrapper)}>
          {
            user.updated &&
            <img
              src={removeIcon}
              className={"exist-when-updated"}
              alt="remove icon"
              onClick={() => reset(user)}
            />
          }
        </div>

        <div className={clsx(style.UserRow)}>
          <div className="d-flex flex-column">
            <label className='font-input-label'>
              {t("firstName")}
            </label>

            <input
              className={clsx(style.Input, 'input mt-10 font-heading-small text-white')}
              value={user?.firstName}
              type="text"
              onChange={(e) => _handleChange(e.target.value, user?.originIndex, 'firstName')}
            />

            {
              touchField?.[index]?.firstName &&
              errorField?.[index]?.firstName && (
                <span className="font-helper-text text-error mt-10">{errorField[index].firstName}</span>
              )
            }
          </div>

          <div className="d-flex flex-column">
            <label className='font-input-label'>
              {t("lastName")}
            </label>

            <input
              className={clsx(style.Input, 'input mt-10 font-heading-small text-white')}
              value={user?.lastName}
              type="text"
              onChange={(e) => _handleChange(e.target.value, user?.originIndex, 'lastName')}
              // onChange={changeFormField}
            />

            {
              touchField?.[index]?.lastName &&
              errorField?.[index]?.lastName && (
                <span className="font-helper-text text-error mt-10">{errorField[index].lastName}</span>
              )
            }
          </div>
        </div>

        <div className={clsx(style.UserRow)}>
          <div className="d-flex flex-column">
            <label className='font-input-label'>
              {t("email")}
            </label>

            <input
              className={clsx(style.Input, 'input mt-10 font-heading-small text-white')}
              value={user?.email}
              type="text"
              onChange={(e) => _handleChange(e.target.value, user?.originIndex, 'email')}
            />

            {
              touchField?.[index]?.email &&
              errorField?.[index]?.email && (
                <span className="font-helper-text text-error mt-10">{errorField[index].email}</span>
              )
            }
          </div>

          <div className="d-flex flex-column">
            <label className="font-input-label text-white text-capitalize">
              {t("team")}
            </label>

            <Select
              className={clsx(style.Select, 'mt-10 font-heading-small text-black')}
              isClearable
              options={formattedTeams}
              value={user?.team}
              styles={customStyles}
              placeholder={t("team name select")}
              onChange={(e) => _handleChange(e?.value, user?.originIndex, 'teamId')}
            />
            {
              touchField?.[index]?.team &&
              errorField?.[index]?.team && (
                <span className="font-helper-text text-error mt-10">{errorField[index].team}</span>
              )
            }
          </div>
        </div>

        <div className={clsx(style.UserRow)}>
          <div className="d-flex flex-column">
            <label className="font-input-label text-white text-capitalize">
              {t("job")}
            </label>

            <Select
              className={clsx(style.Select, 'mt-10 font-heading-small text-black select-custom-class')}
              options={sortedJobs}
              placeholder={t("select")}
              value={user?.job}
              styles={customStyles}
              maxMenuHeight={190}
              onChange={(e) => _handleChange(e?.value, user?.originIndex, 'job')}
            />
            {
              touchField?.[index]?.job &&
              errorField?.[index]?.job && (
                <span className="font-helper-text text-error mt-10">{errorField[index].job}</span>
              )
            }
          </div>

          <div className="d-flex flex-column">
            <label className="font-input-label text-white text-capitalize">
              {t("permission level")}
            </label>

            <Select
              className={clsx(style.Select, 'mt-10 font-heading-small text-black select-custom-class')}
              isMulti
              options={permissionLevels}
              placeholder={t("select")}
              value={user?.permissionLevel}
              styles={customStyles}
              onChange={(e) => _handleChangeForTeamUserType(e, user?.originIndex)}
            />
            {
              touchField?.[index]?.permissionLevel &&
              errorField?.[index]?.permissionLevel && (
                <span className="font-helper-text text-error mt-10">{errorField[index].permissionLevel}</span>
              )
            }
          </div>
        </div>
      </div>
    );
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
      <ConfirmModalV2
        show={visibleDeleteModal}
        header={t('delete user header')}
        subheader={t('delete user description')}
        onOk={deleteUser}
        onCancel={() => setVisibleDeleteModal(false)}
      />
      <AddMemberModalV2
        inviteOnly={inviteMode === 'invite-only'}
        isOpen={visibleAddModal}
        sortedJobs={sortedJobs}
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
            <div className={clsx(style.AddButton, "mt-28")} onClick={addAnother}>
              <img src={plusIcon} className={clsx(style.PlusIcon)} alt="plus icon"/>
              <span className="font-heading-small text-capitalize">
                {t("add another member")}
            </span>
            </div>

            {
              values?.users?.length > 0 &&
              <div className="mt-28">
              <span className="font-heading-small text-uppercase text-orange">
                {t("operators")}
              </span>
              </div>
            }

            {
              values?.users?.map((user, index) => renderUser(user, index, 'user'))
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
              values?.admins?.map((user, index) => renderUser(user, index, 'admin'))
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

const formatJob = (users) => {
  return users && users.map((user) => ({
    ...user,
    job: user?.job?.value,
  }));
};

const formatTeam = (users) => {
  return users && users.map((user) => {
    const teamId = user?.team?.value;
    delete user.team
    return {
      ...user,
      teamId: teamId,
    }
  });
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    users: [defaultTeamMember],
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props, setStatus, setFieldValue}) => {
    const {showErrorNotification, showSuccessNotification, setLoading, t, allTeams} = props;
    // filter users that were modified to update
    let users = [...values?.users ?? [], ...values?.admins ?? []]?.filter(it => it.updated);
    try {
      setLoading(true);
      // const organizationId = localStorage.getItem("kop-v2-picked-organization-id");
      let usersToModify = [];
      users?.forEach(it => {
        if (!!it.userId) {
          usersToModify.push(it);
        }
      });

      usersToModify = formatTeam(formatJob(lowercaseEmail(usersToModify)));

      usersToModify = usersToModify?.map(it => ({
        userId: it.userId,
        firstName: it.firstName,
        lastName: it.lastName,
        job: it.job,
        teamId: it.teamId,
        emailAddress: it.email,
        userTypes: it.userTypes,
      }));

      if (usersToModify?.length > 0) {
        const updatePromises = [];
        let inviteBody = {};
        usersToModify?.forEach(userToModify => {
          const organizationId = allTeams?.find(it => it.id?.toString() === userToModify.teamId?.toString())?.orgId;
          if (!!organizationId) {
            updatePromises.push(updateUserByAdmin(organizationId, userToModify.userId, userToModify));
            if (inviteBody?.[userToModify?.teamId]?.add) {
              inviteBody[userToModify?.teamId].add.push({
                email: userToModify?.emailAddress,
                userTypes: userToModify?.userTypes,
              });
            } else {
              inviteBody[userToModify?.teamId] = {
                add: [
                  {
                    email: userToModify?.emailAddress,
                    userTypes: userToModify?.userTypes,
                  }
                ],
              };
            }
          }
        });
        const failedEmails = [];
        let totalSuccessForModify = 0;

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
              const invitePromises = [];
              Object.keys(inviteBody).forEach((teamId, index) => {
                invitePromises.push(inviteTeamMember(teamId, Object.values(inviteBody)?.[index]));
              });

              if (invitePromises?.length > 0) {
                Promise.allSettled(invitePromises)
                  .finally(() => {
                    setLoading(false);

                    if (failedEmails?.length === 0) {
                      setStatus({visibleSuccessModal: true});
                    }
                    const teamId = props?.match?.params?.id;
                    if (teamId) {
                      loadTeamMembers(teamId, showErrorNotification, setFieldValue, false).catch(e => console.log(e));
                    }
                  });
              } else {
                setLoading(false);
              }
            });
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.log('_handleSubmit error', e);
    } finally {
    }
  }
})(FormInviteModify);

const mapStateToProps = (state) => ({
  allTeams: get(state, 'base.allTeams'),
  loading: get(state, 'ui.loading'),
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
      removeTeamMember: removeTeamMemberAction,
      deleteUser: deleteUserAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));