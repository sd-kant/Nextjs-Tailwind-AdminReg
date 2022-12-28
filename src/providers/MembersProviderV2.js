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
  const [confirmModal, setConfirmModal] = React.useState({visible: false, title: ''});
  const [warningModal, setWarningModal] = React.useState({visible: false, title: '', mode: null}); // mode: move, remove, unlock
  const [selectedTeam, setSelectedTeam] = React.useState(null);
  const [selectedUsersTeams, setSelectedUsersTeams] = React.useState([]);
  const teamName = React.useMemo(() => {
    return formattedTeams?.find(it => it.value?.toString() === selectedTeam?.toString())?.label;
  }, [selectedTeam, formattedTeams]);

  const teamNamePlaceholder = React.useMemo(() => {
    if (selectedUsersTeams?.length > 1) {
      return "multiple teams";
    } else {
      return formattedTeams?.find(it => it.value?.toString() === selectedUsersTeams?.[0]?.toString())?.label;
    }
  }, [selectedUsersTeams, formattedTeams]);

  const handleMoveClick = async teamId => {
    setSelectedTeam(teamId);
    if (selectedMembers?.length > 0) {
      setWarningModal({
        visible: true,
        title: t(
            `move n ${selectedMembers?.length > 1 ? 'users' : 'user'} to team warning title`,
            {n: selectedMembers?.length, team: teamName}),
        mode: `move`,
      });
    }
  };

  const handleRemoveClick = async () => {
    const selectedMembersTeamIds = selectedMembers?.map(it => it.teamId) ?? [];
    if (selectedMembersTeamIds?.length > 0) {
      setWarningModal({
        visible: true,
        title: t(
            `remove n ${selectedMembers?.length > 1 ? 'users' : 'user'} warning title`,
            {n: selectedMembers?.length, team: teamNamePlaceholder}),
        mode: 'remove',
      });
      setSelectedUsersTeams([...new Set(selectedMembersTeamIds)]);
    }
  };

  const hideWarningModal = () => {
    setWarningModal({visible: false, title: '', mode: null});
  };

  const handleWarningOk = React.useCallback(() => {
    const handleMove = async () => {
      moveMember(selectedMembers, selectedTeam)
        .then(() => {
          hideWarningModal();
          setConfirmModal({
            visible: true, title: t(
                `move n ${selectedMembers?.length > 1 ? 'users' : 'user'} to team confirmation title`,
                {n: selectedMembers?.length, team: teamName}
            )
          });
          setSelectedMembers([]);
        })
        .catch(e => {
          console.log("moving member error", e);
        });
    };

    const handleRemove = async () => {
      try {
        const {cnt} = await removeMember(selectedMembers);
        hideWarningModal();
        setConfirmModal({
          visible: true, title: t(
              `remove n ${cnt > 1 ? 'users' : 'user'} confirmation title`,
              {n: cnt, team: teamNamePlaceholder}
          )
        });
        setSelectedMembers([]);
      } catch (e) {
        console.log("moving member error", e);
      }
    };

    switch (warningModal.mode) {
      case 'move':
        handleMove().then();
        break;
      case 'remove':
        handleRemove().then();
        break;
      default:
        console.log("handle mode not registered");
    }
  }, [warningModal, moveMember, removeMember, selectedMembers, selectedTeam, t, teamName, teamNamePlaceholder]);

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
        show={warningModal.visible}
        header={warningModal.title}
        onOk={handleWarningOk}
        onCancel={hideWarningModal}
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