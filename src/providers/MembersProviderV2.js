import * as React from 'react';
import {connect} from "react-redux";
import {useDashboardContext} from "./DashboardProvider";
import {withTranslation} from "react-i18next";
import {setLoadingAction} from "../redux/action/ui";
import {bindActionCreators} from "redux";
import ConfirmModalV2 from "../views/components/ConfirmModalV2";
import ConfirmModal from "../views/components/ConfirmModal";

const MembersContextV2 = React.createContext(null);

export const MembersProviderV2Draft = (
  {
    t,
    children,
  }) => {
  const [selectedMembers, setSelectedMembers] = React.useState([]);
  const {moveMember, formattedTeams, removeMember} = useDashboardContext();
  const [visibleMoveModal, setVisibleMoveModal] = React.useState(false);
  const [visibleRemoveModal, setVisibleRemoveModal] = React.useState(false);
  const [confirmModal, setConfirmModal] = React.useState({visible: false, title: ''});
  const [selectedTeam, setSelectedTeam] = React.useState(null);
  const [selectedUsersTeams, setSelectedUsersTeams] = React.useState([]);
  const teamName = React.useMemo(() => {
    return formattedTeams?.find(it => it.value?.toString() === selectedTeam?.toString())?.label;
  }, [selectedTeam, formattedTeams]);

  const handleMoveClick = async teamId => {
    setSelectedTeam(teamId);
    setVisibleMoveModal(true);
  };

  const handleRemoveClick = async () => {
    const selectedMembersTeamIds = selectedMembers?.map(it => it.teamId) ?? [];
    setSelectedUsersTeams([...new Set(selectedMembersTeamIds)]);
    setVisibleRemoveModal(true);
  };

  const teamNamePlaceholder = React.useMemo(() => {
    if (selectedUsersTeams?.length > 1) {
      return "multiple teams";
    } else {
      return formattedTeams?.find(it => it.value?.toString() === selectedUsersTeams?.[0]?.toString())?.label;
    }
  }, [selectedUsersTeams, formattedTeams]);

  const handleMove = async () => {
    try {
      await moveMember(selectedMembers, selectedTeam);
      setVisibleMoveModal(false);
      setConfirmModal({visible: true, title: t(
          selectedMembers?.length > 1 ?
            'move n users to team confirmation title' :
            'move n user to team confirmation title',
          {n: selectedMembers?.length, team: teamName}
        )});
      setSelectedMembers([]);
    } catch (e) {
      console.log("moving member error", e);
    }
  };

  const handleRemove = async () => {
    try {
      const {cnt} = await removeMember(selectedMembers);
      setVisibleRemoveModal(false);
      setConfirmModal({visible: true, title: t(
          cnt > 1 ?
            'remove n users confirmation title' :
            'remove n user confirmation title',
          {n: cnt, team: teamNamePlaceholder}
        )});
      setSelectedMembers([]);
    } catch (e) {
      console.log("moving member error", e);
    }
  };

  const providerValue = {
    selectedMembers,
    setSelectedMembers,
    handleMoveClick,
    handleRemoveClick,
  };

  return (
    <MembersContextV2.Provider value={providerValue}>
      {children}
      <ConfirmModalV2
        show={visibleMoveModal && selectedMembers?.length > 0}
        header={
          t(
            selectedMembers?.length > 1 ?
              'move n users to team warning title' :
              'move n user to team warning title',
            {n: selectedMembers?.length, team: teamName})
        }
        onOk={handleMove}
        onCancel={() => setVisibleMoveModal(false)}
      />
      <ConfirmModalV2
        show={visibleRemoveModal && selectedMembers?.length > 0}
        header={
          t(
            selectedMembers?.length > 1 ?
              'remove n users warning title' :
              'remove n user warning title',
            {n: selectedMembers?.length, team: teamNamePlaceholder})
        }
        onOk={handleRemove}
        onCancel={() => setVisibleRemoveModal(false)}
      />
      <ConfirmModal
        show={confirmModal.visible}
        header={confirmModal.title}
        onOk={() => {
          setConfirmModal({visible: false, title: ''})
        }}
      />
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