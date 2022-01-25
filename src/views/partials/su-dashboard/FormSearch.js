import React, {useState, useEffect, useMemo} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {withTranslation} from "react-i18next";
import history from "../../../history";
import backIcon from "../../../assets/images/back.svg";
import removeIcon from "../../../assets/images/remove.svg";
import searchIcon from "../../../assets/images/search.svg";
import {
  setLoadingAction,
  setRestBarClassAction,
  setVisibleSuccessModalAction,
  showErrorNotificationAction,
  showSuccessNotificationAction,
} from "../../../redux/action/ui";
import {
  inviteTeamMember, searchMembersUnderOrganization,
  updateUserByAdmin,
} from "../../../http";
import {
  lowercaseEmail,
} from "./FormRepresentative";
import style from "./FormSearch.module.scss";
import clsx from "clsx";
import {customStyles} from "./FormInvite";
import {
  actions,
  AVAILABLE_JOBS,
  permissionLevels,
  USER_TYPE_ADMIN, USER_TYPE_OPERATOR,
  USER_TYPE_ORG_ADMIN, USER_TYPE_TEAM_ADMIN, yesNoOptions
} from "../../../constant";
import {
  deleteUserAction,
  queryAllTeamsAction,
  removeTeamMemberAction,
} from "../../../redux/action/base";
import {searchMembers as searchMembersAPI} from "../../../http";
import {get, isEqual} from "lodash";
import ConfirmModalV2 from "../../components/ConfirmModalV2";
import ConfirmModal from "../../components/ConfirmModal";
// import CustomPhoneInput from "../../components/PhoneInput";
import ResponsiveSelect from "../../components/ResponsiveSelect";
import DropdownButton from "../../components/DropdownButton";
import {getParamFromUrl, updateUrlParam} from "../../../utils";
import Button from "../../components/Button";

let searchTimeout = null;

export const defaultTeamMember = {
  email: '',
  firstName: '',
  lastName: '',
  job: "",
  action: 1,
};

const getPermissionLevelFromUserTypes = (userTypes) => {
  let permissionLevel;
  if (userTypes?.includes(USER_TYPE_ADMIN)) {
    permissionLevel = permissionLevels?.find(it => it.value?.toString() === "3");
  } else if (userTypes?.includes(USER_TYPE_ORG_ADMIN)) {
    permissionLevel = permissionLevels?.find(it => it.value?.toString() === "4");
  } else if (userTypes?.includes(USER_TYPE_TEAM_ADMIN)) {
    permissionLevel = permissionLevels?.find(it => it.value?.toString() === "1");
  } else if (userTypes?.includes(USER_TYPE_OPERATOR)) {
    permissionLevel = permissionLevels?.find(it => it.value?.toString() === "2");
  }

  return permissionLevel;
};

const loadMembers = async ({keyword, showErrorNotification, setFieldValue, initializeTemp = false, organizationId}) => {
  const trimmedKeyword = keyword?.trim()?.toLowerCase();
  if (trimmedKeyword) {
    try {
      let teamMembersResponse;
      if (["undefined", "-1", "null", ""].includes(organizationId?.toString())) {
        teamMembersResponse = await searchMembersAPI(trimmedKeyword);
      } else {
        teamMembersResponse = await searchMembersUnderOrganization({organizationId, keyword: trimmedKeyword});
      }
      let teamMembers = teamMembersResponse?.data;

      teamMembers.forEach((it, index) => {
        let accessibleTeams = [];
        if (it.teamId) {
          accessibleTeams.push({
            teamId: it.teamId,
            userTypes: [USER_TYPE_OPERATOR],
          });
        }

        let permissionLevel = getPermissionLevelFromUserTypes(it?.userTypes);
        if (["1"].includes(permissionLevel?.value?.toString())) { // if this user is an team administrator
          it["teams"]?.forEach(ele => {
            const already = accessibleTeams?.findIndex(item => item.teamId?.toString() === ele.teamId?.toString());
            if (already !== -1) {
              if (accessibleTeams[already]?.userTypes?.length > 0) {
                if (!(accessibleTeams[already]?.userTypes?.includes(USER_TYPE_TEAM_ADMIN))) {
                  const newUserTypes = accessibleTeams[already].userTypes;
                  newUserTypes.push(USER_TYPE_TEAM_ADMIN);
                  accessibleTeams[already] = {
                    teamId: ele.teamId,
                    userTypes: newUserTypes?.sort(),
                  };
                }
              } else {
                accessibleTeams[already] = {
                  teamId: ele.teamId,
                  userTypes: [USER_TYPE_TEAM_ADMIN],
                };
              }
            } else {
              accessibleTeams.push({
                teamId: ele.teamId,
                userTypes: [USER_TYPE_TEAM_ADMIN],
              });
            }
          })
        }

        it['index'] = index;
        it['action'] = 1;
        it['accessibleTeams'] = accessibleTeams;
        it['originalAccessibleTeams'] = accessibleTeams;
        if (!it['teamId'] && it['teams']?.length > 0) {
          it['teamId'] = it['teams'][0]?.teamId;
        }
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
};

const userSchema = (t, values) => {
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
    /*permissionLevel: Yup.object()
      .shape({
        label: Yup.string()
          .required(t('role required'))
      })
      .required(t('role required')),*/
    job: Yup.object()
      .required(t('role required')),
    /*wearingDevice: Yup.object()
      .required(t('wearing device required')),*/
    /*team: Yup.object()
      .test(
        'is-valid',
        t('team name required'),
        function (value) {
          const permissionLevel = get(this.parent.permissionLevel, 'value')?.toString();
          const wearingDevice = this.parent.wearingDevice?.toString();
          return value || !(['1', '2'].includes(permissionLevel) || wearingDevice === 'true');
        },
      ),*/
  }).required();
}

const formSchema = (t, values) => {
  return Yup.object().shape({
    users: Yup.array().of(
      userSchema(t, values),
    ),
  });
};

let intervalForChangesDetect;

const FormSearch = (props) => {
  const {
    values,
    errors,
    touched,
    t,
    loading,
    setLoading,
    setFieldValue,
    showErrorNotification,
    allTeams,
    queryAllTeams,
    setRestBarClass,
    status,
    setStatus,
    deleteUser: deleteAction,
    userType,
    match: {params: {organizationId}},
    isAdmin,
  } = props;
  const [keyword, setKeyword] = useState('');
  const [newChanges, setNewChanges] = useState(0);
  const [visibleDeleteModal, setVisibleDeleteModal] = useState(false);
  const [visibleRemoveModal, setVisibleRemoveModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    setRestBarClass("progress-72 medical");
    loadAllTeams();
    countChanges();
    const keyword = getParamFromUrl('keyword');
    if (keyword) {
      setKeyword(keyword);
    }

    return () => {
      clearInterval(intervalForChangesDetect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    updateUrlParam({param: {key: 'keyword', value: keyword}});
    searchTimeout = setTimeout(() => {
      loadMembers({
        keyword,
        showErrorNotification,
        setFieldValue,
        initializeTemp: true,
        organizationId
      }).catch(e => console.log(e));
    }, 700);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

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

  const formattedTeams = useMemo(() => {
    const teams = [];
    allTeams?.forEach(team => {
      if (
        ["undefined", "-1", "null", ""].includes(organizationId?.toString()) ||
        team?.orgId?.toString() === organizationId?.toString()
      ) {
        teams.push({
          value: team.id,
          label: team.name,
        });
      }
    });
    return teams;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTeams]);

  useEffect(() => {
    let users = [];

    values?.["tempTeamMembers"]?.forEach((it, index) => {
      const item = {
        ...formatForFormValue(it),
        originIndex: index,
      };
      const updated = isUpdated(item);
      users.push({
        ...item,
        updated,
      });
    });
    setFieldValue("users", users);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values["teamMembers"], values?.["tempTeamMembers"], formattedTeams]);

  const formatForFormValue = (it) => {
    return {
      index: it.index,
      userId: it.userId,
      teamId: it?.teamId,
      firstName: it.firstName,
      lastName: it.lastName,
      email: it.email,
      job: sortedJobs?.find(ele => ele.value?.toString() === (it?.job?.toString() ?? "14")),
      userTypes: it.userTypes,
      accessibleTeams: it.accessibleTeams,
      originalAccessibleTeams: it.originalAccessibleTeams,
      action: it.action,
      phoneNumber: {
        value: it.phoneNumber,
      },
    }
  };

  const loadAllTeams = () => {
    queryAllTeams();
  };

  const navigateTo = (path) => {
    history.push(path);
  };

  const sortedJobs = useMemo(() => {
    return AVAILABLE_JOBS && AVAILABLE_JOBS.sort((a, b) => {
      return a.label > b.label ? 1 : -1;
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [AVAILABLE_JOBS]);

  const goBack = () => {
    navigateTo(`/invite/${isAdmin ? organizationId : -1}/team-mode`);
  };

  const deleteUser = () => {
    if (selectedUser?.userId) {
      alert('todo delete user');
      // deleteAction(selectedUser.userId);
    }
  };

  const _handleChange = (value, index, key) => {
    const temp = (values?.["tempTeamMembers"] && JSON.parse(JSON.stringify(values?.["tempTeamMembers"]))) ?? [];
    temp[index][key] = value;
    setFieldValue("tempTeamMembers", temp);
  };

  const checkIfHigherThanMe = (permissionLevel) => {
    if (userType.includes(USER_TYPE_ADMIN)) {
      return false;
    } else if (userType.includes(USER_TYPE_ORG_ADMIN)) {
      return ["3"].includes(permissionLevel?.value?.toString());
    } else if (userType.includes(USER_TYPE_TEAM_ADMIN)) {
      return ["3", "4"].includes(permissionLevel?.value?.toString());
    }

    return true;
  }

  const _handleChangeForTeamUserType = (optionValue, index, fromWearingDevice) => {
    // todo if permission level null
    const temp = (values?.["tempTeamMembers"] && JSON.parse(JSON.stringify(values?.["tempTeamMembers"]))) ?? [];
    let roleToAdd = null;
    let roleToRemove = [];
    let needToUpdateAccessibleTeams = false;

    if (fromWearingDevice) {
      needToUpdateAccessibleTeams = true;
      if (optionValue?.value?.toString() === "true") {
        roleToAdd = USER_TYPE_OPERATOR;
      } else if (optionValue?.value?.toString() === "false") {
        roleToRemove = [USER_TYPE_OPERATOR];
      }
    } else {
      /*check if logged-in-user has right to change role*/
      if (checkIfHigherThanMe(optionValue)) {
        return;
      }
      if (optionValue?.value?.toString() === "2") { // if team admin
        roleToAdd = USER_TYPE_OPERATOR;
        roleToRemove = [USER_TYPE_TEAM_ADMIN, USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN];
        needToUpdateAccessibleTeams = true;
      } else if (optionValue?.value?.toString() === "1") { // if team operator
        roleToAdd = USER_TYPE_TEAM_ADMIN;
        roleToRemove = [USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN];
        needToUpdateAccessibleTeams = true;
      } else if (optionValue?.value?.toString() === "3") { // super admin
        roleToAdd = USER_TYPE_ADMIN;
        roleToRemove = [USER_TYPE_TEAM_ADMIN, USER_TYPE_ORG_ADMIN];
      } else if (optionValue?.value?.toString() === "4") { // org admin
        roleToAdd = USER_TYPE_ORG_ADMIN;
        roleToRemove = [USER_TYPE_TEAM_ADMIN, USER_TYPE_ADMIN];
      }
    }
    if (needToUpdateAccessibleTeams) {
      // todo optimize this code part
      // update accessibleTeams of tempTeamUsers
      let newAccessibleTeams = temp[index]?.accessibleTeams;
      const currentSelectedTeamId = temp[index]?.teamId;
      const alreadyIndex = temp[index]?.accessibleTeams?.findIndex(it => it.teamId?.toString() === currentSelectedTeamId?.toString());
      if (alreadyIndex !== -1) {
        if (roleToAdd) {
          const a = temp[index]?.accessibleTeams[alreadyIndex];
          if (a?.userTypes?.length > 0) {
            if (!(temp[index]?.accessibleTeams[alreadyIndex]?.userTypes?.includes(roleToAdd))) {
              const b = newAccessibleTeams[alreadyIndex].userTypes;
              b.push(roleToAdd);
              newAccessibleTeams[alreadyIndex] = {
                teamId: currentSelectedTeamId,
                userTypes: b,
              };
            }
          } else {
            newAccessibleTeams[alreadyIndex] = {
              teamId: currentSelectedTeamId,
              userTypes: [roleToAdd],
            };
          }
        }
        // remove role based on roleToRemove
        newAccessibleTeams[alreadyIndex] = {
          teamId: currentSelectedTeamId,
          userTypes: newAccessibleTeams[alreadyIndex]?.userTypes.filter(it => !roleToRemove.includes(it)),
        };
      } else {
        if (roleToAdd) {
          newAccessibleTeams.push({
            teamId: currentSelectedTeamId,
            userTypes: [roleToAdd],
          });
        }
      }
      if (roleToAdd === USER_TYPE_OPERATOR) {
        // only remain as team operator on current team
        newAccessibleTeams = newAccessibleTeams?.map(it => {
          if (it?.teamId?.toString() !== currentSelectedTeamId?.toString()) {
            return {
              teamId: it?.teamId,
              userTypes: it?.userTypes?.filter(ele => ele !== USER_TYPE_OPERATOR),
            }
          }
          return it;
        });
      }
      newAccessibleTeams = newAccessibleTeams?.map((it) => {
        return {
          ...it,
          userTypes: it.userTypes?.sort(),
        };
      });
      // remove team whose userTypes is empty
      newAccessibleTeams = newAccessibleTeams?.filter((it) => {
        return it?.userTypes?.length > 0;
      });

      temp[index]["accessibleTeams"] = newAccessibleTeams;
      setFieldValue("tempTeamMembers", temp);
    }

    if (roleToRemove?.length > 0) {
      temp[index]["userTypes"] = temp[index]["userTypes"].filter(it => !roleToRemove.includes(it));
    }
    if (roleToAdd && !temp[index]["userTypes"]?.includes(roleToAdd)) {
      temp[index]["userTypes"].push(roleToAdd);
    }

    setFieldValue("tempTeamMembers", temp);
  };

  const isUpdated = (user) => {
    const origins = values?.["teamMembers"]?.filter(it => it.index === user.index) ?? [];
    if (origins?.length > 0) {
      // todo optimize this logic
      const keysInOrigin = ["firstName", "lastName", "email"];
      const keys = ["firstName", "lastName", "email"];
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
        if (!isEqual(get(user, "userTypes")?.sort(), get(origin, "userTypes")?.sort())) {
          ret = true;
        }
        if (!isEqual(get(user, "accessibleTeams")?.sort(), get(origin, "accessibleTeams")?.sort())) {
          ret = true;
        }
        // No Role Defined will be selected as default when user's job role is null, and this will not be considered as updated
        if (get(user, "job.value") !== get(origin, "job")) {
          if (!(get(user, "job.value") === "14" && [null, undefined, ""].includes(get(origin, "job")))) {
            ret = true;
          }
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

  const removeFromTeam = async () => {
    if (selectedUser?.teamId && selectedUser?.email) {
      try {
        alert("todo remove from team");
        return;
        setLoading(true);
        await inviteTeamMember(selectedUser?.teamId, {
          remove: [selectedUser.email],
        });

        let temp = values?.["teamMembers"].filter(it => it.email !== selectedUser.email);
        setFieldValue("teamMembers", temp);
        temp = values?.["tempTeamMembers"].filter(it => it.email !== selectedUser.email);
        setFieldValue("tempTeamMembers", temp);

        setVisibleRemoveModal(false);
      } catch (e) {
        showErrorNotification(e.response?.data?.message || t("msg something went wrong"));
      } finally {
        setLoading(false);
      }
    }
  };

  const reInviteUser = () => {
    // todo if organization admin will receive invitation?
    alert('todo re-invite user');
  };

  const _onAction = user => {
    switch (user?.action) {
      case 1:
        setSelectedUser(user);
        reInviteUser();
        break;
      case 2:
        setSelectedUser(user);
        setVisibleRemoveModal(true);
        break;
      case 3:
        setSelectedUser(user);
        setVisibleDeleteModal(true);
        break;
      default:
        console.log('action type not valid');
    }
  }

  const doableActions = useMemo(() => {
    if (userType?.includes(USER_TYPE_ADMIN)) {
      return actions;
    } else if (userType?.includes(USER_TYPE_ORG_ADMIN)) {
      return actions;
    } else if (userType?.includes(USER_TYPE_TEAM_ADMIN)) {
      return actions.filter(it => it.value !== 3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userType]);

  const approvalGreen = '#35EA6C';

  const resetPhoneNumber = async (userId) => {
    try {
      setLoading(true);
      await updateUserByAdmin(organizationId, userId, {
        phoneNumber: "",
      });
      // set phone number null on values
      for (let keys = ["tempTeamMembers", "teamMembers"], i = 0; i < keys.length; i++) {
        const temp = (values?.[keys[i]] && JSON.parse(JSON.stringify(values?.[keys[i]]))) ?? [];
        const index = temp.findIndex(it => it.userId?.toString() === userId?.toString());
        if (index !== -1) {
          temp[index]['phoneNumber'] = null;
          setFieldValue(keys[i], temp);
        }
      }
    } catch (e) {
      console.log("reset phone number error", e.response?.data);
      showErrorNotification(e.response?.data?.message || t("msg something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  const renderUser = (user, index, key) => {
    let errorField = errors?.users;
    let touchField = touched?.users;
    const userPermissionLevel = getPermissionLevelFromUserTypes(user?.userTypes);
    const hasRightToEdit = !checkIfHigherThanMe(userPermissionLevel);
    // todo optimize this code part
    // tie permission level to team
    let selectedTeam = null;
    if (user?.accessibleTeams?.length > 0) {
      selectedTeam = formattedTeams?.find(it => it.value?.toString() === user?.teamId?.toString());
    }

    let selectedPermissionLevel = null;
    const entity = user?.accessibleTeams?.find(ele => ele.teamId?.toString() === selectedTeam?.value?.toString());

    if (["3"].includes(userPermissionLevel?.value?.toString())) { // if super admin
      selectedPermissionLevel = permissionLevels?.find(it => it.value?.toString() === "3");
    } else if (["4"].includes(userPermissionLevel?.value?.toString())) { // if org admin
      selectedPermissionLevel = permissionLevels?.find(it => it.value?.toString() === "4");
    } else {
      selectedPermissionLevel = getPermissionLevelFromUserTypes(entity?.userTypes);
    }
    const wearingDeviceDisabled = selectedPermissionLevel?.value?.toString() === "2" || !isAdmin || !hasRightToEdit;
    const newlyFormattedTeams = formattedTeams.map(it => {
      let color;
      if (!(["3", "4"].includes(selectedPermissionLevel?.value?.toString()))) {
        color = user?.accessibleTeams?.some(ele => (ele.teamId?.toString() === it?.value?.toString()) && ele.userTypes?.length > 0) ? approvalGreen : 'white';
      } else {
        color = user?.accessibleTeams?.some(ele => (ele.teamId?.toString() === it?.value?.toString()) && ele.userTypes?.includes(USER_TYPE_OPERATOR)) ? approvalGreen : 'white';
      }
      return {
        ...it,
        color,
      };
    });

    newlyFormattedTeams.sort((a, b) => {
      let aAffect = 0;
      let bAffect = 0;
      if (a.color === approvalGreen) {
        aAffect = 2;
      } else if (b.color === approvalGreen) {
        bAffect = 2;
      }
      const t = aAffect - bAffect;
      if (t === 0) {
        return a.name?.toLowerCase() > b.name?.toLowerCase() ? -1 : 1;
      }

      return t * -1;
    });

    let wearingDeviceSelected = yesNoOptions?.[1];
    if (entity?.userTypes?.includes(USER_TYPE_OPERATOR)) {
      wearingDeviceSelected = yesNoOptions?.[0];
    }
    const hiddenPhoneNumber = (user?.phoneNumber?.value) ? t('ends with', {number: user?.phoneNumber?.value?.slice(-4)}) : t("not registered");
    const phoneNumberInputDisabled = !((user?.phoneNumber?.value) && isAdmin);

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
              className={clsx(style.Input, (!isAdmin || !hasRightToEdit) ? style.DisabledInput : null, 'input mt-10 font-heading-small text-white')}
              value={user?.firstName}
              disabled={!isAdmin || !hasRightToEdit}
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
              className={clsx(style.Input, (!isAdmin || !hasRightToEdit) ? style.DisabledInput : null, 'input mt-10 font-heading-small text-white')}
              value={user?.lastName}
              type="text"
              disabled={!isAdmin || !hasRightToEdit}
              onChange={(e) => _handleChange(e.target.value, user?.originIndex, 'lastName')}
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
              className={clsx(style.Input, style.DisabledInput, 'input mt-10 font-heading-small text-white')}
              value={user?.email}
              type="text"
              disabled={true}
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

            <ResponsiveSelect
              className={clsx(style.Select, 'mt-10 font-heading-small text-black')}
              isClearable
              options={newlyFormattedTeams}
              value={selectedTeam}
              styles={customStyles(!hasRightToEdit)}
              placeholder={t("team name select")}
              menuPortalTarget={document.body}
              menuPosition={'fixed'}
              isDisabled={!hasRightToEdit}
              onChange={(e) => _handleChange(e?.value, user?.originIndex, 'teamId')}
            />
            {/*fixme fix validation rule */}
            {/*{
              touchField?.[index]?.team &&
              errorField?.[index]?.team && (
                <span className="font-helper-text text-error mt-10">{get(errorField, `${index}.team`)}</span>
              )
            }*/}
          </div>
        </div>

        <div className={clsx(style.UserRow)}>
          <div className="d-flex flex-column">
            <label className="font-input-label text-white text-capitalize">
              {t("job")}
            </label>

            <ResponsiveSelect
              className={clsx(style.Select, 'mt-10 font-heading-small text-black select-custom-class')}
              options={sortedJobs}
              placeholder={t("select")}
              value={user?.job}
              styles={customStyles(!isAdmin || !hasRightToEdit)}
              maxMenuHeight={190}
              isDisabled={!isAdmin || !hasRightToEdit}
              menuPortalTarget={document.body}
              menuPosition={'fixed'}
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
            {/*fixme make clearable dropdown*/}
            <ResponsiveSelect
              className={clsx(style.Select, 'mt-10 font-heading-small text-black select-custom-class')}
              options={permissionLevels}
              placeholder={t("select")}
              value={selectedPermissionLevel}
              styles={customStyles(!isAdmin || !hasRightToEdit)}
              isDisabled={!isAdmin || !hasRightToEdit}
              menuPortalTarget={document.body}
              menuPosition={'fixed'}
              onChange={(e) => _handleChangeForTeamUserType(e, user?.originIndex, false)}
            />
            {/* fixme fix validation rule */}
            {/*{
              touchField?.[index]?.permissionLevel &&
              errorField?.[index]?.permissionLevel && (
                <span
                  className="font-helper-text text-error mt-10">{get(errorField, `${index}.permissionLevel.label`)}</span>
              )
            }*/}
          </div>
        </div>

        <div className={clsx(style.UserRow, 'mt-10')}>
          <div className={style.GroupWrapper2}>
            <div className="d-flex flex-column">
              <label className='font-input-label'>
                {t("phone number")}
              </label>
              <input
                className={clsx(style.InputHalf, style.DisabledInput, 'input mt-10 font-heading-small text-white text-capitalize')}
                value={hiddenPhoneNumber}
                type="text"
                disabled={true}
                onChange={() => {
                }}
              />
            </div>

            <div className="d-flex flex-column justify-end">
              <div className={clsx(style.ButtonWrapper)}>
                <Button
                  title={t('reset')}
                  borderColor={'orange'}
                  bgColor={'gray'}
                  disabled={phoneNumberInputDisabled}
                  onClick={() => resetPhoneNumber(user?.userId, user?.originIndex)}
                />
              </div>
            </div>
          </div>

          <div className={style.GroupWrapper}>
            <div className="d-flex flex-column">
              <label className="font-input-label text-white text-capitalize">
                {t("wearing a device")}
              </label>
              <ResponsiveSelect
                className={clsx(style.Select, 'mt-10 font-heading-small text-black select-custom-class')}
                options={yesNoOptions}
                placeholder={t("select")}
                value={wearingDeviceSelected}
                styles={customStyles(wearingDeviceDisabled)}
                isDisabled={wearingDeviceDisabled}
                menuPortalTarget={document.body}
                menuPosition={'fixed'}
                onChange={(e) => _handleChangeForTeamUserType(e, user?.originIndex, true)}
              />
            </div>

            <div className="d-flex flex-column justify-end">
              <div className={clsx(style.ButtonWrapper)}>
                <DropdownButton
                  option={user?.action}
                  options={doableActions}
                  onClick={() => _onAction(user)}
                  onClickOption={value => _handleChange(value, user?.originIndex, 'action')}
                />
              </div>
            </div>
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
      <ConfirmModalV2
        show={visibleRemoveModal}
        header={t('remove team user header')}
        subheader={t('remove team user description')}
        onOk={removeFromTeam}
        onCancel={() => setVisibleRemoveModal(false)}
      />
      <ConfirmModalV2
        show={visibleDeleteModal}
        header={t('delete user header')}
        subheader={t('delete user description')}
        onOk={deleteUser}
        onCancel={() => setVisibleDeleteModal(false)}
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
              <span className='font-header-medium d-block text-capitalize'>
                {t("search")}
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
              values?.users?.map((user, index) => renderUser(user, index, 'user'))
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

const setUserType = (users) => {
  return users && users.map((user) => {
    const userTypes = user?.userTypes;
    let userType = "";
    if (userTypes?.includes(USER_TYPE_ADMIN)) {
      userType = USER_TYPE_ADMIN;
    } else if (userTypes?.includes(USER_TYPE_ORG_ADMIN)) {
      userType = USER_TYPE_ORG_ADMIN;
    }
    return {
      ...user,
      userType: userType,
    }
  });
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    users: [defaultTeamMember],
  }),
  validationSchema: ((props) => Yup.lazy(values => formSchema(props.t, values))),
  handleSubmit: async (values, {props, setStatus, setFieldValue}) => {
    const {showErrorNotification, showSuccessNotification, setLoading, t, match: {params: {organizationId}}} = props;
    // filter users that were modified to update
    let users = (values?.users ?? [])?.filter(it => it.updated);
    // fixme optimize
    try {
      setLoading(true);
      let usersToModify = [];
      users?.forEach(it => {
        if (!!it.userId) {
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

      const {userType} = props;

      if (usersToModify?.length > 0) {
        const updatePromises = [];
        let inviteBody = {};
        usersToModify?.forEach(userToModify => {
          if (!(["undefined", "-1", "null", ""].includes(organizationId?.toString()))) {
            const isAdmin = [USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN].some(it => userType?.includes(it));
            if (isAdmin) {
              updatePromises.push(updateUserByAdmin(organizationId, userToModify.userId, userToModify));
            }
            if (!([USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN].includes(userToModify.userType))) { // if not super admin or org admin
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
              });
            }
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
    } finally {
    }
  },
  enableReinitialize: true,
})(FormSearch);

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
      removeTeamMember: removeTeamMemberAction,
      deleteUser: deleteUserAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));