import * as React from "react";
import {connect} from "react-redux";
import {customStyles} from "./FormInvite";
import ResponsiveSelect from "../../components/ResponsiveSelect";
import DropdownButton from "../../components/DropdownButton";
import {withTranslation} from "react-i18next";
import {checkIfHigherThanMe, getPermissionLevelFromUserTypes} from "../../../providers/MembersProvider";
import {
  permissionLevels,
  USER_TYPE_OPERATOR,
  yesNoOptions,
} from "../../../constant";
import clsx from "clsx";
import style from "./SearchUserItem.module.scss";
import removeIcon from "../../../assets/images/remove.svg";
import {get} from "lodash";
import {useMembersContext} from "../../../providers/MembersProvider";

const SearchUserItem = (
  {
    user,
    index,
    isAdmin,
    errorField,
    touchField,
    t,
  }) => {
  const {
    userType,
    teams,
    jobs,
    doableActions,
    handleMemberInfoChange,
    handleMemberTeamChange,
    handleMemberTeamUserTypeChange,
    handleResetUpdates,
    handlePhoneOptionClick,
    handleActionOptionClick,
  } = useMembersContext();

  const approvalGreen = '#35EA6C';
  const userPermissionLevel = getPermissionLevelFromUserTypes(user?.userTypes);
  const hasRightToEdit = !checkIfHigherThanMe(userType, userPermissionLevel);
  const selectedTeam = teams?.find(it => it.value?.toString() === user?.teamId?.toString());
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
  const newlyFormattedTeams = teams.map(it => {
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
  const ableToResetPhoneNumber = (user?.phoneNumber?.value) && isAdmin;

  const phoneDropdownOptions = React.useMemo(() => {
    if (ableToResetPhoneNumber) {
      return [
        {
          value: 1,
          label: hiddenPhoneNumber,
        },
        {
          value: 2,
          label: 'Reset registered phone number',
        },
      ];
    }
    return [];
  }, [hiddenPhoneNumber, ableToResetPhoneNumber]);

  return (
    <div className={clsx(style.User)}>
      <div className={clsx(style.RemoveIconWrapper)}>
        {
          user.updated &&
          <img
            src={removeIcon}
            className={"exist-when-updated"}
            alt="remove icon"
            onClick={() => handleResetUpdates(user)}
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
            onChange={(e) => handleMemberInfoChange(e.target.value, user?.originIndex, 'firstName')}
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
            onChange={(e) => handleMemberInfoChange(e.target.value, user?.originIndex, 'lastName')}
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
            onChange={(e) => handleMemberInfoChange(e.target.value, user?.originIndex, 'email')}
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
            onChange={(e) => handleMemberTeamChange(e?.value, user?.originIndex, selectedPermissionLevel)}
          />
          {/*fixme fix validation rule */}
        </div>
      </div>

      <div className={clsx(style.UserRow)}>
        <div className="d-flex flex-column">
          <label className="font-input-label text-white text-capitalize">
            {t("job")}
          </label>

          <ResponsiveSelect
            className={clsx(style.Select, 'mt-10 font-heading-small text-black select-custom-class')}
            options={jobs}
            placeholder={t("select")}
            value={user?.job}
            styles={customStyles(!isAdmin || !hasRightToEdit)}
            maxMenuHeight={190}
            isDisabled={!isAdmin || !hasRightToEdit}
            menuPortalTarget={document.body}
            menuPosition={'fixed'}
            onChange={(e) => handleMemberInfoChange(e?.value, user?.originIndex, 'job')}
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
            onChange={(e) => handleMemberTeamUserTypeChange(e, user?.originIndex, false, user?.teamId)}
          />
          {/* fixme fix validation rule */}
        </div>
      </div>

      <div className={clsx(style.UserRow)}>
        <div className="d-flex flex-column">
          <label className='font-input-label'>
            {t("phone number")}
          </label>
          {
            ableToResetPhoneNumber ?
              <div className={clsx(style.PhoneWrapper, 'mt-10')}>
                <DropdownButton
                  placeholder={t("select action")}
                  option={user?.phoneAction}
                  options={phoneDropdownOptions}
                  onClick={() => {}}
                  onClickOption={value => {
                    handlePhoneOptionClick(value, user)
                  }}
                />
              </div> :
              <input
                className={clsx(style.Input, style.DisabledInput, 'input mt-10 font-heading-small text-white text-capitalize')}
                value={hiddenPhoneNumber}
                type="text"
                disabled={true}
                onChange={() => {
                }}
              />
          }
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
              onChange={(e) => handleMemberTeamUserTypeChange(e, user?.originIndex, true, user?.teamId)}
            />
          </div>

          <div className="d-flex flex-column">
            <label className="font-input-label text-white text-capitalize">
              {t("actions")}
            </label>

            <div className={clsx(style.ButtonWrapper)}>
              <DropdownButton
                placeholder={t("select action")}
                option={user?.action}
                options={doableActions}
                onClick={() => {}}
                onClickOption={value => {
                  handleActionOptionClick(value, user);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  isAdmin: get(state, 'auth.isAdmin'),
});

export default connect(
  mapStateToProps,
  null,
)(withTranslation()(SearchUserItem));
