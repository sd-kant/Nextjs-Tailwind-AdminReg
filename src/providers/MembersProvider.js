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
} from "../constant";
import {queryAllTeamsAction} from "../redux/action/base";
import {
  searchMembers as searchMembersAPI,
  searchMembersUnderOrganization,
  updateUserByAdmin,
  inviteTeamMember,
} from "../http";
import {get, isEqual} from "lodash";
import ConfirmModalV2 from "../views/components/ConfirmModalV2";
import {withTranslation} from "react-i18next";
import {setLoadingAction, showErrorNotificationAction} from "../redux/action/ui";

const MembersContext = React.createContext(null);

export const getPermissionLevelFromUserTypes = (userTypes) => {
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

export const checkIfHigherThanMe = (myUserType, opponentPermissionLevel) => {
  if (myUserType.includes(USER_TYPE_ADMIN)) {
    return false;
  } else if (myUserType.includes(USER_TYPE_ORG_ADMIN)) {
    return ["3"].includes(opponentPermissionLevel?.value?.toString());
  } else if (myUserType.includes(USER_TYPE_TEAM_ADMIN)) {
    return ["3", "4"].includes(opponentPermissionLevel?.value?.toString());
  }

  return true;
}

const MembersProvider = (
  {
    children,
    organizationId,
    userType,
    allTeams,
    queryAllTeams,
    t,
    setLoading,
    showErrorNotification,
  }) => {
  const [members, setMembers] = React.useState([]);
  const [tempMembers, setTempMembers] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [visibleDeleteModal, setVisibleDeleteModal] = React.useState(false);
  const [visibleRemoveModal, setVisibleRemoveModal] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);

  React.useEffect(() => {
    loadAllTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAllTeams = () => {
    queryAllTeams();
  };

  const teams = React.useMemo(() => {
    const entities = [];
    allTeams?.forEach(team => {
      if (
        ["undefined", "-1", "null", ""].includes(organizationId?.toString()) ||
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
    tempMembers?.forEach((it, index) => {
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
    setUsers(users);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempMembers, teams]);

  const formatForFormValue = (it) => {
    return {
      index: it.index,
      userId: it.userId,
      teamId: it?.teamId,
      firstName: it.firstName,
      lastName: it.lastName,
      email: it.email,
      job: jobs?.find(ele => ele.value?.toString() === (it?.job?.toString() ?? "14")),
      userTypes: it.userTypes,
      accessibleTeams: it.accessibleTeams,
      originalAccessibleTeams: it.originalAccessibleTeams,
      action: it.action,
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

  const initializeMembers = async (
    {
      keyword,
      mode = "search",
    }) => {
    if (mode === "search") {
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
          setMembers(teamMembers);
          setTempMembers(teamMembers);
        } catch (e) {
          showErrorNotification(e.response?.data?.message || t("msg something went wrong"));
        }
      }
    }
  };

  const handleMemberInfoChange = (value, index, key) => {
    const temp = (tempMembers && JSON.parse(JSON.stringify(tempMembers))) ?? [];
    temp[index][key] = value;
    setTempMembers(temp);
  };

  const handleMemberTeamUserTypeChange = (optionValue, index, fromWearingDevice) => {
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
      setTempMembers(temp);
    }

    if (roleToRemove?.length > 0) {
      temp[index]["userTypes"] = temp[index]["userTypes"].filter(it => !roleToRemove.includes(it));
    }
    if (roleToAdd && !temp[index]["userTypes"]?.includes(roleToAdd)) {
      temp[index]["userTypes"].push(roleToAdd);
    }

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

  const handleResetPhoneNumber = async (userId) => {
    try {
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
    } catch (e) {
      console.log("reset phone number error", e.response?.data);
      showErrorNotification(e.response?.data?.message || t("msg something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromTeam = async () => {
    if (selectedUser?.teamId && selectedUser?.email) {
      try {
        alert("todo remove from team");
        return;
        // todo if organization admin user is selected
        setLoading(true);
        await inviteTeamMember(selectedUser?.teamId, {
          remove: [selectedUser.email],
        });
        let temp = tempMembers?.filter(it => it.email !== selectedUser.email);
        setTempMembers(temp);
        temp = members?.filter(it => it.email !== selectedUser.email);
        setMembers(temp);

        setVisibleRemoveModal(false);
      } catch (e) {
        showErrorNotification(e.response?.data?.message || t("msg something went wrong"));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser?.userId) {
      alert('todo delete user');
      // todo delete user
    }
  };

  const handleReInvite = () => {
    alert('todo re-invite user');
    // todo if organization admin will receive invitation?
  };

  const handleActionButtonClick = user => {
    switch (user?.action) {
      case 1: // re-invite
        setSelectedUser(user);
        handleReInvite();
        break;
      case 2: // remove from team
        setSelectedUser(user);
        setVisibleRemoveModal(true);
        break;
      case 3: // delete
        setSelectedUser(user);
        setVisibleDeleteModal(true);
        break;
      default:
        console.log('action type not valid');
    }
  }

  const providerValue = {
    userType,
    users,
    teams,
    jobs,
    doableActions,
    selectedUser,
    setSelectedUser,
    initializeMembers,
    handleMemberInfoChange,
    handleMemberTeamUserTypeChange,
    handleResetUpdates,
    handleResetPhoneNumber,
    handleReInvite,
    handleDeleteUser,
    handleActionButtonClick,
  };

  return (
    <MembersContext.Provider value={providerValue}>
      <ConfirmModalV2
        show={visibleRemoveModal}
        header={t('remove team user header')}
        subheader={t('remove team user description')}
        onOk={handleRemoveFromTeam}
        onCancel={() => setVisibleRemoveModal(false)}
      />
      <ConfirmModalV2
        show={visibleDeleteModal}
        header={t('delete user header')}
        subheader={t('delete user description')}
        onOk={handleDeleteUser}
        onCancel={() => setVisibleDeleteModal(false)}
      />
      {children}
    </MembersContext.Provider>
  );
};

const mapStateToProps = (state) => ({
  allTeams: get(state, 'base.allTeams'),
  userType: get(state, 'auth.userType'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      queryAllTeams: queryAllTeamsAction,
      setLoading: setLoadingAction,
      showErrorNotification: showErrorNotificationAction,
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
