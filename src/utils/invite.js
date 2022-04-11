import {
  searchMembersUnderOrganization,
  searchMembers,
  inviteTeamMemberV2, createUserByAdmin,
} from "../http";
import {USER_TYPE_OPERATOR, USER_TYPE_TEAM_ADMIN} from "../constant";

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
    email: user.email ? user.email.toLowerCase() : null,
  }));
}

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
              // todo find user by phone number
            }
          });
        }

        if (findPromises?.length > 0) {
          Promise.allSettled(findPromises)
            .then(items => {
              items.forEach((item, index) => {
                if (item.status === "fulfilled") {
                  if (item.value?.data?.length === 1) {
                    const userItem = item.value?.data?.[0];
                    ret[index] = {
                      ...ret[index],
                      userId: userItem?.userId,
                    };
                  }
                } else { //
                  // this is because the member is not in the scope of current logged-in user
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
