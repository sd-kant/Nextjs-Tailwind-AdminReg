import * as React from 'react';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {
  AVAILABLE_JOBS,
  actions,
  USER_TYPE_ADMIN,
  USER_TYPE_ORG_ADMIN,
  USER_TYPE_TEAM_ADMIN,
  USER_TYPE_OPERATOR,
  permissionLevels,
  INVALID_VALUES1,
} from "../constant";
import {queryAllTeamsAction} from "../redux/action/base";
import {
  searchMembers as searchMembersAPI,
  searchMembersUnderOrganization,
  updateUserByAdmin,
  queryTeamMembers as queryTeamMembersAPI,
  getUsersUnderOrganization,
  deleteUser,
  reInviteOrganizationUser,
  reInviteTeamUser,
  unlockUser,
  inviteTeamMemberV2,
} from "../http";
import {get, isEqual} from "lodash";
import ConfirmModalV2 from "../views/components/ConfirmModalV2";
import {withTranslation} from "react-i18next";
import {
  setLoadingAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from "../redux/action/ui";
import {updateUrlParam} from "../utils";
import ConfirmModal from "../views/components/ConfirmModal";
import {useParams} from "react-router-dom";
import {
  checkIfHigherThanMe,
  getPermissionLevelFromUserTypes
} from "../utils/members";

const MembersContext = React.createContext(null);
let searchTimeout = null;

const MembersProvider = (
  {
    children,
    userType,
    isAdmin,
    allTeams,
    queryAllTeams,
    t,
    setLoading,
    showErrorNotification,
    showSuccessNotification,
  }) => {
  const {organizationId, id} = useParams();
  const [keyword, setKeyword] = React.useState('');
  const [keywordOnInvite, setKeywordOnInvite] = React.useState('');
  const [searchedUsers, setSearchedUsers] = React.useState([]);
  const [members, setMembers] = React.useState([]);
  const [tempMembers, setTempMembers] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [admins, setAdmins] = React.useState([]);
  const [confirmModal, setConfirmModal] = React.useState({
    title: null,
    visible: false,
  });
  const [warningModal, setWarningModal] = React.useState({
    title: null,
    visible: false,
    subtitle: null,
    mode: null, // reset-phone, re-invite, remove, delete, unlock, invite
  });
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [page, setPage] = React.useState('');
  const [teamId, setTeamId] = React.useState(id);

  React.useEffect(() => {
    loadAllTeams();
    return () => {
      setTeamId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAllTeams = () => {
    queryAllTeams();
  };

  React.useEffect(() => {
    initializeMembers().then();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, page]);
  const trimmedKeyword = React.useMemo(() => keyword.trim().toLowerCase(), [keyword]);
  React.useEffect(() => {
    if (page === "search") {
      if (searchTimeout)
        clearTimeout(searchTimeout);
      updateUrlParam({param: {key: 'keyword', value: trimmedKeyword}});
      searchTimeout = setTimeout(() => {
        initializeMembers().then();
      }, 700);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmedKeyword]);

  const teams = React.useMemo(() => {
    const entities = [];
    allTeams?.forEach(team => {
      if (
        [undefined, "-1", null, ""].includes(organizationId?.toString()) ||
        team?.orgId?.toString() === organizationId?.toString()
      ) {
        entities.push({
          value: team.id,
          label: team.name,
        });
      }
    });
    return entities;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTeams]);

  const jobs = React.useMemo(() => {
    return AVAILABLE_JOBS && AVAILABLE_JOBS.sort((a, b) => {
      return a.label > b.label ? 1 : -1;
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [AVAILABLE_JOBS]);

  const doableActions = React.useMemo(() => {
    if (userType?.includes(USER_TYPE_ADMIN)) {
      return actions;
    } else if (userType?.includes(USER_TYPE_ORG_ADMIN)) {
      return actions;
    } else if (userType?.includes(USER_TYPE_TEAM_ADMIN)) {
      return actions.filter(it => it.value !== 3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userType]);

  React.useEffect(() => {
    let users = [];
    let admins = [];
    tempMembers?.forEach((it, index) => {
      const memberItem = {
        ...formatForFormValue(it),
        originIndex: index,
      };
      memberItem["updated"] = isUpdated(memberItem);

      if (page === "modify") {
        if (
          !trimmedKeyword ||
          [it.email?.toLowerCase(), it.firstName?.toLowerCase(), it.lastName?.toLowerCase()].some(item => item?.includes(trimmedKeyword))
        ) {
          if (
            [USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN].some(ele => memberItem?.userTypesOrigin?.includes(ele)) || // if super or org admin
            memberItem?.originalAccessibleTeams?.some(ele => ele.teamId?.toString() === teamId?.toString() && ele.userTypes?.includes(USER_TYPE_TEAM_ADMIN)) // if this team's team admin
          ) { // if member has admin role
            admins.push(memberItem);
          } else {
            users.push(memberItem);
          }
        }
      } else if (page === "search") {
        users.push(memberItem);
      }
    });
    setUsers(users);
    setAdmins(admins);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempMembers, teams, trimmedKeyword]);

  const formatForFormValue = (it) => {
    return {
      index: it.index,
      userId: it.userId,
      teamId: it?.teamId,
      firstName: it.firstName,
      lastName: it.lastName,
      email: it.email,
      job: jobs?.find(ele => ele.value?.toString() === (it?.job?.toString() ?? "no-role")),
      userTypes: it.userTypes,
      userTypesOrigin: it.userTypesOrigin,
      accessibleTeams: it.accessibleTeams,
      originalAccessibleTeams: it.originalAccessibleTeams,
      action: it.action,
      locked: it.locked,
      phoneAction: it.phoneAction,
      phoneNumber: {
        value: it.phoneNumber,
      },
    }
  };

  const isUpdated = (user) => {
    const origins = members?.filter(it => it.index === user.index) ?? [];
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
          if (!(get(user, "job.value") === "no-role" && [null, undefined, ""].includes(get(origin, "job")))) {
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

  const initializeMembers = async () => {
    try {
      let teamMembers = [];
      if (page === "search") {
        if (trimmedKeyword) {
          let teamMembersResponse;
          if ([undefined, "-1", null, ""].includes(organizationId?.toString())) {
            teamMembersResponse = await searchMembersAPI(trimmedKeyword);
          } else {
            teamMembersResponse = await searchMembersUnderOrganization({organizationId, keyword: trimmedKeyword});
          }
          teamMembers = teamMembersResponse?.data;
        }
      } else if (page === "modify") {
        let teamMembersResponse;
        if (["", null, undefined].includes(teamId?.toString())) {
          return;
        }
        if (teamId?.toString() === "-1") {
          teamMembersResponse = await getUsersUnderOrganization({userType: 'unassigned', organizationId});
          teamMembers = teamMembersResponse?.data?.filter(ele => !(ele.teamId || ele?.teams?.length > 0));
        } else {
          teamMembersResponse = await queryTeamMembersAPI(teamId);
          teamMembers = teamMembersResponse?.data?.members;
        }
      }

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
        it['email'] = it.email ?? "";
        it['firstName'] = it.firstName ?? "";
        it['lastName'] = it.lastName ?? "";
        it['action'] = null;
        it['phoneAction'] = 1;
        it['accessibleTeams'] = accessibleTeams;
        it['originalAccessibleTeams'] = accessibleTeams;
        it['job'] = it['job'] ?? "no-role";
        it['userTypesOrigin'] = it.userTypes;
        if (!(["", "-1", null, undefined].includes(teamId))) {
          it['teamId'] = teamId;
        } else if (!it['teamId'] && it['teams']?.length > 0) {
          it['teamId'] = it['teams']?.some(ele => ele?.teamId?.toString() === teamId?.toString()) ? teamId : it['teams'][0]?.teamId;
        }
      });
      teamMembers?.sort((a, b) => {
        if (a?.lastName?.localeCompare(b?.lastName) !== 0) {
          return a?.lastName?.localeCompare(b?.lastName);
        } else if (a?.firstName?.localeCompare(b?.firstName) !== 0) {
          return a?.firstName?.localeCompare(b?.firstName);
        } else {
          return a?.email?.localeCompare(b?.email);
        }
      });
      setMembers(teamMembers);
      setTempMembers(teamMembers);
    } catch (e) {
      showErrorNotification(e.response?.data?.message || t("msg something went wrong"));
    }
  };

  const handleMemberInfoChange = (value, index, key) => {
    const temp = (tempMembers && JSON.parse(JSON.stringify(tempMembers))) ?? [];
    temp[index][key] = value;
    setTempMembers(temp);
  };

  const handleMemberTeamChange = (value, index, permissionLevel) => {
    const temp = JSON.parse(JSON.stringify(tempMembers ?? []));
    if (!temp[index])
      return;
    temp[index]["teamId"] = value;
    setTempMembers(temp);

    if (permissionLevel?.value?.toString() === "1") { // if team admin
      handleMemberTeamUserTypeChange(permissionLevels.find(it => it.value?.toString() === "1"), index, false, value);
    } else if (permissionLevel?.value?.toString() === "2") { // if operator
      handleMemberTeamUserTypeChange(permissionLevels.find(it => it.value?.toString() === "2"), index, false, value);
    }
  };

  const handleMemberTeamUserTypeChange = (optionValue, index, fromWearingDevice, currentSelectedTeamId) => {
    // todo if permission level null
    const temp = (tempMembers && JSON.parse(JSON.stringify(tempMembers))) ?? [];
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
      if (checkIfHigherThanMe(userType, optionValue)) {
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
      setTempMembers(temp);
    }

    if (roleToRemove?.length > 0) {
      temp[index]["userTypes"] = temp[index]["userTypes"].filter(it => !roleToRemove.includes(it));
    }
    if (roleToAdd && !temp[index]["userTypes"]?.includes(roleToAdd)) {
      temp[index]["userTypes"].push(roleToAdd);
    }
    // don't delete, this is important
    temp[index]["teamId"] = currentSelectedTeamId;
    setTempMembers(temp);
  };

  const handleResetUpdates = (user) => {
    const temp = JSON.parse(JSON.stringify(tempMembers ?? []));
    if (typeof user.originIndex === 'number' && user.originIndex !== -1) {
      if (!(user?.userId)) { // if newly added
        temp?.splice(user.originIndex, 1);
      } else {
        const origin = members?.find(it => it.userId === user.userId);
        temp?.splice(user.originIndex, 1, origin);
      }
      setTempMembers(temp?.sort((a, b) => a?.lastName?.localeCompare(b?.lastName)));
    }
  };

  const handleResetPhoneNumber = React.useCallback(async () => {
    if (!selectedUser?.userId)
      return;

    try {
      const userId = selectedUser?.userId;
      setLoading(true);
      await updateUserByAdmin(organizationId, userId, {
        phoneNumber: "",
      });
      // set phone number null on values
      let temp = (JSON.parse(JSON.stringify(members ?? [])));
      let index = temp.findIndex(it => it.userId?.toString() === userId?.toString());
      if (index !== -1) {
        temp[index]['phoneNumber'] = null;
        setMembers(temp);
      }
      temp = (JSON.parse(JSON.stringify(tempMembers ?? [])));
      index = temp.findIndex(it => it.userId?.toString() === userId?.toString());
      if (index !== -1) {
        temp[index]['phoneNumber'] = null;
        setTempMembers(temp);
      }
      handleWarningHide();
      setConfirmModal({
        title: t("reset phone confirmation title"),
        visible: true,
      });
    } catch (e) {
      console.log("reset phone number error", e.response?.data);
      showErrorNotification(e.response?.data?.message || t("msg something went wrong"));
    } finally {
      setLoading(false);
    }
  }, [members, organizationId, selectedUser, setLoading, showErrorNotification, t, tempMembers]);

  const handleRemoveFromTeam = React.useCallback(async () => {
    if (selectedUser?.teamId && selectedUser?.userId) {
      try {
        setLoading(true);
        await inviteTeamMemberV2(selectedUser?.teamId, {
          remove: [selectedUser.userId],
        });
        handleWarningHide();
        setConfirmModal({visible: true, title: t("remove user confirmation title")});
        showSuccessNotification(t('msg user removed success', {
          user: `${selectedUser?.firstName} ${selectedUser?.firstName}`,
        }));
        if (selectedUser?.teamId?.toString() === teamId?.toString()) {
          setMembers(prev => prev?.filter(it => it.userId?.toString() !== selectedUser.userId?.toString()));
          setTempMembers(prev => prev?.filter(it => it.userId?.toString() !== selectedUser.userId?.toString()));
        }
      } catch (e) {
        showErrorNotification(e.response?.data?.message || t("msg something went wrong"));
      } finally {
        setLoading(false);
      }
    }
  }, [selectedUser, setLoading, showErrorNotification, showSuccessNotification, t, teamId]);

  const handleDeleteUser = React.useCallback(() => {
    // only super or org admin can do this
    if (userType?.some(it => [USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN].includes(it))) {
      if (!(INVALID_VALUES1.includes(organizationId?.toString())) && selectedUser?.userId) {
        setLoading(true);
        deleteUser({
          organizationId,
          userId: selectedUser?.userId,
        })
          .then(() => {
            handleWarningHide();
            setConfirmModal({visible: true, title: t("delete user confirmation title")});
            setMembers(prev => prev.filter(it => it.userId?.toString() !== selectedUser.userId.toString()));
            setTempMembers(prev => prev.filter(it => it.userId?.toString() !== selectedUser.userId.toString()));
            showSuccessNotification(t("msg user deleted success", {
              user: `${selectedUser?.firstName} ${selectedUser?.lastName}`,
            }));
          })
          .catch(e => {
            showErrorNotification(e.response?.data?.message || t("msg something went wrong"));
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [organizationId, selectedUser, setLoading, showErrorNotification, showSuccessNotification, t, userType]);

  const _handleUnlockUser = React.useCallback(() => {
    setLoading(true);
    let fTeamId = teamId;
    if (INVALID_VALUES1.includes(teamId?.toString())) {
      fTeamId = teams?.[0].value;
    }
    if (INVALID_VALUES1.includes(fTeamId?.toString())) return;

    unlockUser({
      teamId: fTeamId,
      userId: selectedUser?.userId,
    })
      .then(() => {
        handleWarningHide();
        setConfirmModal({
          visible: true,
          title: t("unlock user confirmation title", {name: `${selectedUser?.firstName} ${selectedUser?.lastName}`})
        });
        setMembers(prev => prev.map(it => it.userId?.toString() === selectedUser.userId.toString() ? {
          ...it,
          locked: false
        } : it));
        setTempMembers(prev => prev.map(it => it.userId?.toString() === selectedUser.userId.toString() ? {
          ...it,
          locked: false
        } : it));
      })
      .catch(e => {
        showErrorNotification(e.response?.data?.message || t("msg something went wrong"));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [teamId, selectedUser, setLoading, showErrorNotification, t, teams]);

  const handleReInvite = React.useCallback(() => {
    const user = selectedUser;
    let requestHttp = null;
    let payload = null;
    if (userType?.some(it => [USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN].includes(it))) { // super or org admin
      if (!INVALID_VALUES1.includes(organizationId?.toString()) && user?.userId) {
        requestHttp = reInviteOrganizationUser;
        payload = {
          organizationId: organizationId,
          userId: user.userId,
        };
      }
    } else if (userType?.includes(USER_TYPE_TEAM_ADMIN)) { // team admin
      if (user?.userId) {
        const originUser = members.find(it => it.userId?.toString() === user?.userId?.toString());
        let teamId = allTeams?.some(it => it.id?.toString() === originUser?.teamId?.toString()) ?
          originUser?.teamId : null;
        if (!teamId) {
          teamId = originUser?.accessibleTeams.find(it => (allTeams?.some(ele => ele.id?.toString() === it.teamId?.toString())))?.teamId;
        }
        if (teamId) {
          requestHttp = reInviteTeamUser;
          payload = {
            teamId: teamId,
            userId: user.userId,
          };
        }
      }
    }

    if (requestHttp) {
      setLoading(true);
      requestHttp(payload)
        .then(() => {
          handleWarningHide();
          setConfirmModal({
            visible: true,
            title: t("re-invite user confirmation title"),
          });
          showSuccessNotification(t("msg user invite success", {
            user: `${user?.firstName} ${user?.lastName}`,
          }));
        })
        .catch(e => {
          showErrorNotification(e.response?.data?.message || t("msg something went wrong"));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [allTeams, members, organizationId, selectedUser, setLoading, showErrorNotification, showSuccessNotification, t, userType]);

  const handlePhoneOptionClick = (value, user) => {
    switch (value?.toString()) {
      case "1":
        break;
      case "2":
        setSelectedUser(user);
        setWarningModal({
          visible: true,
          title: t("reset phone warning title"),
          subtitle: null,
          mode: 'reset-phone',
        });
        break;
      default:
        console.log('please select valid phone action type');
    }
  };

  const handleActionOptionClick = (value, user) => {
    const userPermissionLevel = getPermissionLevelFromUserTypes(user?.userTypes);
    const hasRightToEdit = !checkIfHigherThanMe(userType, userPermissionLevel);

    switch (value?.toString()) {
      case "1": // re-invite
        setSelectedUser(user);
        setWarningModal({
          visible: true,
          title: t("re-invite user warning title"),
          subtitle: null,
          mode: 're-invite',
        });
        break;
      case "2": // remove from team
        setSelectedUser(user);
        setWarningModal({
          visible: true,
          title: t("remove user warning title"),
          subtitle: null,
          mode: 'remove',
        });
        break;
      case "3": // delete
        if (!hasRightToEdit) {
          // don't need this to be translated because this code part will never run(UI prevented from triggering this action)
          showErrorNotification("You have no right to delete this user");
        } else {
          setSelectedUser(user);
          setWarningModal({
            visible: true,
            title: t('delete user warning title'),
            subtitle: t('delete user warning description'),
            mode: 'delete',
          });
        }
        break;
      default:
        console.log('please select valid action type');
    }
  };

  const handleWarningHide = () => {
    setWarningModal({
      visible: false,
      title: null,
      subtitle: null,
      mode: null,
    });
  };

  const handleInviteUser = React.useCallback(async () => {
    return new Promise((resolve, reject) => {
      const filteredUserTypes = selectedUser?.userTypes?.filter(it => [USER_TYPE_TEAM_ADMIN, USER_TYPE_OPERATOR].includes(it));
      const userId = selectedUser?.userId;
      if (teamId && userId && filteredUserTypes) {
        const payload = {
          add: [{
            userId,
            userTypes: filteredUserTypes?.length > 0 ? filteredUserTypes : [USER_TYPE_OPERATOR],
          }]
        };
        setLoading(true);
        inviteTeamMemberV2(teamId, payload)
          .then(() => {
            setWarningModal({
              visible: false,
              title: null,
              subtitle: null,
              mode: null,
            });
            setSearchedUsers(prev => (prev?.filter(it => it.userId?.toString() !== userId?.toString()) ?? []));
            initializeMembers().then();
            showSuccessNotification(t("msg user invite success", {
              user: `${selectedUser?.firstName} ${selectedUser?.lastName}`,
            }));
            setSelectedUser(null);
            resolve();
          })
          .catch(e => {
            console.error("invite user error", e);
            reject();
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        reject();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ selectedUser, showSuccessNotification, t, teamId, setLoading]);

  const handleWarningOk = React.useCallback(() => {
    switch (warningModal.mode) {
      case 'reset-phone':
        handleResetPhoneNumber().then();
        break;
      case 're-invite':
        handleReInvite();
        break;
      case 'remove':
        handleRemoveFromTeam().then();
        break;
      case 'delete':
        handleDeleteUser();
        break;
      case 'unlock':
        _handleUnlockUser();
        break;
      case 'invite':
        handleInviteUser().then();
        break;
      default:
        console.log("not registered action");
    }
  }, [warningModal.mode, handleResetPhoneNumber, handleReInvite, handleRemoveFromTeam, handleDeleteUser, _handleUnlockUser, handleInviteUser]);

  const handleUnlockUser = user => {
    setSelectedUser(user);
    setWarningModal({
      visible: true,
      title: t('unlock user warning title'),
      subtitle: null,
      mode: 'unlock',
    });
  };

  const handleInviteClick = userId => {
    const user = searchedUsers?.find(it => it.userId?.toString() === userId?.toString());
    if (teamId && user) {
      setSelectedUser(user);
      const teamName = teams?.find(it => it.value?.toString() === teamId?.toString())?.label;
      const userName = `${user.firstName} ${user.lastName}`;

      setWarningModal({
        visible: true,
        title: t('invite user', {user: userName, team: teamName}),
        subtitle: null,
        mode: 'invite',
      });
    }
  };

  const trimmedKeywordOnInvite = React.useMemo(() => keywordOnInvite?.trim()?.toLowerCase(), [keywordOnInvite]);
  React.useEffect(() => {
    if (trimmedKeywordOnInvite) {
      let promise = null;
      let promiseBody = {};
      if (isAdmin && ![undefined, "-1", null, ""].includes(organizationId?.toString())) {
        promise = searchMembersUnderOrganization;
        promiseBody = {organizationId, keyword: trimmedKeywordOnInvite};
      } else {
        promise = searchMembersAPI;
        promiseBody = trimmedKeywordOnInvite;
      }
      if (promise) {
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }

        const load = () => {
          return new Promise((resolve, reject) => {
            searchTimeout = setTimeout(async () => {
              try {
                const res = await promise(promiseBody);
                resolve(res.data);
              } catch (e) {
                reject(e);
              }
            }, 700);
          })
        };

        try {
          load().then(res => setSearchedUsers(res));
        } catch (e) {
          console.error("load based on keywordOnInvite error", e);
          setSearchedUsers([]);
        }
      }
    } else {
      setSearchedUsers([]);
    }
  }, [trimmedKeywordOnInvite, isAdmin, organizationId]);
  const dropdownItems = React.useMemo(() => {
    return searchedUsers?.filter(it => users?.every(ele => ele.userId?.toString() !== it.userId?.toString()) && admins?.every(ele => ele.userId?.toString() !== it.userId?.toString()))?.map(it => ({
      value: it.userId,
      title: `${it.firstName} ${it.lastName}`,
      subtitle: it.email ?? it.phoneNumber,
    })) ?? [];
  }, [searchedUsers, users, admins]);

  const providerValue = {
    userType,
    users,
    admins,
    members,
    teams,
    jobs,
    doableActions,
    selectedUser,
    keyword,
    setKeyword,
    page,
    setTeamId,
    setPage,
    setSelectedUser,
    dropdownItems,
    keywordOnInvite,
    setKeywordOnInvite,
    initializeMembers,
    handleMemberInfoChange,
    handleMemberTeamUserTypeChange,
    handleMemberTeamChange,
    handleResetUpdates,
    handlePhoneOptionClick,
    handleActionOptionClick,
    handleUnlockUser,
    handleInviteClick,
  };

  return (
    <MembersContext.Provider value={providerValue}>
      <ConfirmModalV2
        show={warningModal.visible}
        header={warningModal.title}
        subheader={warningModal.subtitle}
        onOk={handleWarningOk}
        onCancel={handleWarningHide}
      />
      <ConfirmModal
        show={confirmModal?.visible}
        header={confirmModal?.title}
        onOk={() => setConfirmModal({title: null, visible: false})}
      />
      {children}
    </MembersContext.Provider>
  );
};

const mapStateToProps = (state) => ({
  allTeams: get(state, 'base.allTeams'),
  userType: get(state, 'auth.userType'),
  myOrganizationId: get(state, 'auth.organizationId'),
  isAdmin: get(state, 'auth.isAdmin'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      queryAllTeams: queryAllTeamsAction,
      setLoading: setLoadingAction,
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction,
    },
    dispatch
  );

export const WrappedMembersProvider = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(MembersProvider));

export const useMembersContext = () => {
  const context = React.useContext(MembersContext);
  if (!context) {
    throw new Error("useMembersContext must be used within MembersProvider");
  }
  return context;
};
