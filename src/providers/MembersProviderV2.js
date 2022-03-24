import * as React from 'react';
import {connect} from "react-redux";
import {useDashboardContext} from "./DashboardProvider";
import {USER_TYPE_OPERATOR, USER_TYPE_TEAM_ADMIN} from "../constant";
import {inviteTeamMember} from "../http";
import {useNotificationContext} from "./NotificationProvider";
import {withTranslation} from "react-i18next";
import {setLoadingAction} from "../redux/action/ui";
import {bindActionCreators} from "redux";

const MembersContextV2 = React.createContext(null);

export const MembersProviderV2Draft = (
  {
    children,
    setLoading,
  }) => {
  const [selectedMembers, setSelectedMembers] = React.useState([]);
  const {pickedTeams} = useDashboardContext();
  const {addNotification} = useNotificationContext();

  const handleMove = async teamId => {
    const addObj = [];
    // fixme translation
    selectedMembers?.forEach(member => {
      if (member.teamId?.toString() !== teamId?.toString()) { // check if user from another team
        const userTypes = [USER_TYPE_OPERATOR];
        if (member.teams?.some(it => it.teamId?.toString() === teamId?.toString())) { // check if user is a team admin
          userTypes.push(USER_TYPE_TEAM_ADMIN);
        }
        addObj.push({
          email: member.email,
          userTypes,
        });
      } else {
        addNotification(
          `${member.firstName} ${member.lastName} is already on the team.`,
          'success',
        );
      }
    });
    if (addObj.length > 0) {
      try {
        setLoading(true);
        await inviteTeamMember(teamId, {
          add: addObj,
        });
        addNotification(
          `${addObj.length} users were moved to the team.`,
          'success',
        );
        if (pickedTeams?.every(it => it.toString() !== teamId.toString())) {
          // todo move members to new team
        }
      } catch (e) {
        // fixme
        addNotification(
          e.response?.data?.message,
          'error',
        );
      } finally {
        setLoading(false);
        setSelectedMembers([]);
      }
    }
  };

  const providerValue = {
    selectedMembers,
    setSelectedMembers,
    handleMove,
  };

  return (
    <MembersContextV2.Provider value={providerValue}>
      {children}
    </MembersContextV2.Provider>
  );
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
    },
    dispatch
  );

export const MembersProviderV2 = connect(
  null,
  mapDispatchToProps,
)(withTranslation()(MembersProviderV2Draft));

export const useMembersContextV2 = () => {
  const context = React.useContext(MembersContextV2);
  if (!context) {
    throw new Error("useMembersContextV2 must be used within MembersProviderV2");
  }
  return context;
};