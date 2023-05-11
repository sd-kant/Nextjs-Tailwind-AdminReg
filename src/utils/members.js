import {
  permissionLevels,
  USER_TYPE_ADMIN,
  USER_TYPE_OPERATOR,
  USER_TYPE_ORG_ADMIN,
  USER_TYPE_TEAM_ADMIN
} from '../constant';

export const getPermissionLevelFromUserTypes = (userTypes) => {
  let permissionLevel;
  if (userTypes?.includes(USER_TYPE_ADMIN)) {
    permissionLevel = permissionLevels?.find((it) => it.value?.toString() === '3');
  } else if (userTypes?.includes(USER_TYPE_ORG_ADMIN)) {
    permissionLevel = permissionLevels?.find((it) => it.value?.toString() === '4');
  } else if (userTypes?.includes(USER_TYPE_TEAM_ADMIN)) {
    permissionLevel = permissionLevels?.find((it) => it.value?.toString() === '1');
  } else if (userTypes?.includes(USER_TYPE_OPERATOR)) {
    permissionLevel = permissionLevels?.find((it) => it.value?.toString() === '2');
  }

  return permissionLevel;
};

export const checkIfHigherThanMe = (myUserType, opponentPermissionLevel) => {
  if (myUserType.includes(USER_TYPE_ADMIN)) {
    return false;
  } else if (myUserType.includes(USER_TYPE_ORG_ADMIN)) {
    return ['3'].includes(opponentPermissionLevel?.value?.toString());
  } else if (myUserType.includes(USER_TYPE_TEAM_ADMIN)) {
    return ['3', '4'].includes(opponentPermissionLevel?.value?.toString());
  }

  return true;
};
