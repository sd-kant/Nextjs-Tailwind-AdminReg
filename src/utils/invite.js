import {
  searchMembersUnderOrganization,
  searchMembers,
  inviteTeamMemberV2, createUserByAdmin, updateUserByAdmin, searchMembersByPhone,
} from "../http";
import {USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN, USER_TYPE_OPERATOR, USER_TYPE_TEAM_ADMIN} from "../constant";
import {isEqual} from "lodash";

const setTeamIdToUsers = (users, teamId) => {
  return users && users.map((user) => ({
    ...user,
    teamId,
  }));
}

const formatUserType = (users) => {
  return users && users.map((user) => ({
    ...user,
    userTypes: [user?.userType?.value?.toString() === "1" ? USER_TYPE_TEAM_ADMIN : USER_TYPE_OPERATOR],
    userType: user?.userType?.value?.toString() === "1" ? USER_TYPE_TEAM_ADMIN : null,
  }));
}

const formatJob = (users) => {
  return users && users.map((user) => ({
    ...user,
    job: user?.job?.value,
  }));
}

const formatPhoneNumber = (users) => {
  return users && users.map((user) => ({
    ...user,
    phoneNumber: user?.phoneNumber?.value ? `+${user?.phoneNumber?.value}` : null,
  }));
}

const formatEmail = (users) => {
  return users && users.map((user) => ({
    ...user,
    // fixme admin can set user's email as empty, in this case how to un-assign email from user
    email: user.email ? user.email.toLowerCase() : null,
  }));
}
// create users
export const _handleSubmitV2 = (
  {
    users: unFormattedUsers,
    setLoading,
    organizationId,
    teamId,
    isAdmin,
  }
) => {
  return new Promise((resolve) => {
    const findAndInviteUsers = payload => {
      return new Promise((resolve) => {
        const findPromises = [];
        let ret = [];

        if (typeof payload === "object" && payload?.length > 0) {
          ret = new Array(...payload);
          payload.forEach(item => {
            if (item.mode === "email") {
              if (isAdmin) { // if super or org admin
                findPromises.push(searchMembersUnderOrganization({keyword: item.email, organizationId}))
              } else { // if team admin
                findPromises.push(searchMembers(item.email));
              }
            } else if (item.mode === "phoneNumber") {
              findPromises.push(searchMembersByPhone(item.phoneNumber));
            }
          });
        }

        if (findPromises?.length > 0) {
          Promise.allSettled(findPromises)
            .then(items => {
              items.forEach((item, index) => {
                let userItem = null;
                if (item.status === "fulfilled") {
                  if (item.value?.config?.url?.includes("user/phone")) { // if find by phone number
                    userItem = item.value?.data;
                  } else { // if find by keyword
                    if (item.value?.data?.length === 1) {
                      userItem = item.value?.data?.[0];
                    }
                  }
                } else { //
                  // this is because the member is not in the scope of current logged-in user
                }
                if (userItem) {
                  ret[index] = {
                    ...ret[index],
                    userId: userItem?.userId,
                  };
                }
              });
            })
            .finally(() => {
              const inviteBody = {add: []};
              ret.forEach(item => {
                if (item.userId) {
                  inviteBody.add.push({
                    userId: item.userId,
                    userTypes: item.userTypes,
                  });
                }
              });
              let added = 0;
              inviteTeamMemberV2(teamId, inviteBody)
                .then(res => {
                  added = (res.data?.added?.length ?? 0);
                })
                .finally(() => {
                  resolve(added);
                });
            });
        } else {
          resolve(0);
        }
      })
    };

    setLoading(true);
    const users = setTeamIdToUsers(
      formatUserType(formatPhoneNumber(formatJob(formatEmail(unFormattedUsers)))),
      teamId
    );
    const promises = [];
    users?.forEach(it => {
      promises.push(createUserByAdmin(organizationId, it));
    });

    const alreadyRegisteredUsers = [];
    let totalSuccessForInvite = 0;

    Promise.allSettled(promises)
      .then(items => {
        items.forEach((item, index) => {
          if (item.status === "fulfilled") {
            totalSuccessForInvite++;
          } else {
            const error = item.reason?.response?.data;
            console.error("creating user failed", error);
            if (
              error?.status?.toString() === "409" &&
              ["error.email.exists", "error.phone.exists"].includes(error?.error)
            ) {
              alreadyRegisteredUsers.push({
                email: users[index]?.email ?? null,
                phoneNumber: users[index]?.phoneNumber ?? null,
                userTypes: users[index]?.userTypes,
                mode: error?.error === "error.email.exists" ? "email" : "phoneNumber",
              });
            }
          }
        });
      })
      .finally(() => {
        findAndInviteUsers(alreadyRegisteredUsers)
          .then(numberOfAdded => {
            totalSuccessForInvite += numberOfAdded;
          })
          .finally(() => {
            resolve({
              alreadyRegisteredUsers,
              numberOfSuccess: totalSuccessForInvite,
            });
            setLoading(false);
          });
      });
  });
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

// update users
export const handleModifyUsers = (
  {
    setLoading,
    users,
    organizationId,
    isAdmin,
    setStatus,
    showErrorNotification,
    showSuccessNotification,
    t,
  }) => {
  // fixme optimize the code
  try {
    setLoading(true);
    let usersToModify = [];
    users?.forEach(it => {
      if (it.userId) {
        usersToModify.push(it);
      }
    });
    usersToModify = setUserType(formatJob(formatEmail(usersToModify)));
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
                inviteBody[originalAccessibleTeam.teamId].remove.push(userToModify?.userId);
              } else {
                inviteBody[originalAccessibleTeam.teamId] = {remove: [userToModify?.userId]};
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
                    userId: userToModify?.userId,
                    userTypes: accessibleTeam?.userTypes,
                  });
                } else {
                  inviteBody[accessibleTeam.teamId] = {
                    add: [
                      {
                        userId: userToModify?.userId,
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
            invitePromises.push(inviteTeamMemberV2(teamId, Object.values(inviteBody)?.[index]));
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
