import * as React from 'react';
import { connect } from 'react-redux';
import { useDashboardContext } from './DashboardProvider';
import { withTranslation } from 'react-i18next';
import { setLoadingAction } from '../redux/action/ui';
import { bindActionCreators } from 'redux';
import ConfirmModalV2 from '../views/components/ConfirmModalV2';
import ConfirmModal from '../views/components/ConfirmModal';

const MembersContextV2 = React.createContext(null);

export const MembersProviderV2Draft = ({ t, children }) => {
  const [selectedMembers, setSelectedMembers] = React.useState([]);
  const { moveMember, moveMemberToOrg, formattedTeams, formattedOrganizations, removeMember } =
    useDashboardContext();
  const [confirmModal, setConfirmModal] = React.useState({ visible: false, title: '' });
  const [warningModal, setWarningModal] = React.useState({ visible: false, title: '', mode: null }); // mode: move, remove, unlock
  const [selectedTeam, setSelectedTeam] = React.useState(null);
  const [selectedOrg, setSelectedOrg] = React.useState(null);
  const [selectedUsersTeams, setSelectedUsersTeams] = React.useState([]);
  const teamName = React.useMemo(() => {
    return formattedTeams?.find((it) => it.value?.toString() === selectedTeam?.toString())?.label;
  }, [selectedTeam, formattedTeams]);

  const orgName = React.useMemo(() => {
    return formattedOrganizations?.find((it) => it.value?.toString() === selectedOrg?.toString())
      ?.label;
  }, [selectedOrg, formattedOrganizations]);

  const teamNamePlaceholder = React.useMemo(() => {
    if (selectedUsersTeams?.length > 1) {
      return 'multiple teams';
    } else {
      return formattedTeams?.find(
        (it) => it.value?.toString() === selectedUsersTeams?.[0]?.toString()
      )?.label;
    }
  }, [selectedUsersTeams, formattedTeams]);

  const handleMoveClick = async (teamId) => {
    setSelectedTeam(teamId);
    if (selectedMembers?.length > 0) {
      setWarningModal({
        visible: true,
        title: t(`move n ${selectedMembers?.length > 1 ? 'users' : 'user'} to team warning title`, {
          n: selectedMembers?.length,
          team: teamName
        }),
        mode: `move`
      });
    }
  };

  const handleMoveToAnotherOrgClick = async (orgId) => {
    setSelectedOrg(orgId);
    if (selectedMembers?.length > 0) {
      setWarningModal({
        visible: true,
        title: t(
          `move n ${selectedMembers?.length > 1 ? 'users' : 'user'} to organization warning title`,
          {
            n: selectedMembers?.length,
            organization: orgName
          }
        ),
        mode: `move org`
      });
    }
  };

  React.useEffect(() => {
    if (selectedMembers?.length > 0) {
      if (warningModal.mode === 'move') {
        setWarningModal({
          visible: true,
          title: t(
            `move n ${selectedMembers?.length > 1 ? 'users' : 'user'} to team warning title`,
            {
              n: selectedMembers?.length,
              team: teamName
            }
          ),
          mode: `move`
        });
      } else if (warningModal.mode === 'move org') {
        setWarningModal({
          visible: true,
          title: t(
            `move n ${
              selectedMembers?.length > 1 ? 'users' : 'user'
            } to organization warning title`,
            {
              n: selectedMembers?.length,
              organization: orgName
            }
          ),
          mode: `move org`
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warningModal.visible, teamName, selectedMembers?.length]);

  React.useEffect(() => {
    const selectedMembersTeamIds = selectedMembers?.map((it) => it.teamId) ?? [];
    setSelectedUsersTeams([...new Set(selectedMembersTeamIds)]);
  }, [selectedMembers]);

  const handleRemoveClick = async () => {
    const selectedMembersTeamIds = selectedMembers?.map((it) => it.teamId) ?? [];
    if (selectedMembersTeamIds?.length > 0) {
      setWarningModal({
        visible: true,
        title: t(`remove n ${selectedMembers?.length > 1 ? 'users' : 'user'} warning title`, {
          n: selectedMembers?.length,
          team: teamNamePlaceholder
        }),
        mode: 'remove'
      });
    }
  };

  const hideWarningModal = () => {
    setWarningModal({ visible: false, title: '', mode: null });
  };

  const handleWarningOk = React.useCallback(() => {
    const handleMoveToOrg = async () => {
      moveMemberToOrg(selectedMembers, selectedOrg)
        .then(() => {
          hideWarningModal();
          setConfirmModal({
            visible: true,
            title: t(
              `move n ${
                selectedMembers?.length > 1 ? 'users' : 'user'
              } to organization confirmation title`,
              { n: selectedMembers?.length, organization: orgName }
            )
          });
          setSelectedMembers([]);
        })
        .catch((e) => {
          console.log('moving member to org error', e);
        });
    };

    const handleMove = async () => {
      moveMember(selectedMembers, selectedTeam)
        .then(() => {
          hideWarningModal();
          setConfirmModal({
            visible: true,
            title: t(
              `move n ${selectedMembers?.length > 1 ? 'users' : 'user'} to team confirmation title`,
              { n: selectedMembers?.length, team: teamName }
            )
          });
          setSelectedMembers([]);
        })
        .catch((e) => {
          console.log('moving member error', e);
        });
    };

    const handleRemove = async () => {
      try {
        const { cnt } = await removeMember(selectedMembers);
        hideWarningModal();
        setConfirmModal({
          visible: true,
          title: t(`remove n ${cnt > 1 ? 'users' : 'user'} confirmation title`, {
            n: cnt,
            team: teamNamePlaceholder
          })
        });
        setSelectedMembers([]);
      } catch (e) {
        console.log('moving member error', e);
      }
    };

    switch (warningModal.mode) {
      case 'move':
        handleMove().then();
        break;
      case 'move org':
        handleMoveToOrg().then();
        break;
      case 'remove':
        handleRemove().then();
        break;
      default:
        console.log('handle mode not registered');
    }
  }, [
    warningModal,
    moveMember,
    removeMember,
    selectedMembers,
    selectedTeam,
    t,
    teamName,
    teamNamePlaceholder,
    orgName,
    moveMemberToOrg,
    selectedOrg
  ]);

  const providerValue = {
    selectedMembers,
    setSelectedMembers,
    handleMoveClick,
    handleMoveToAnotherOrgClick,
    handleRemoveClick
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
          setConfirmModal({ visible: false, title: '' });
        }}
      />
    </MembersContextV2.Provider>
  );
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction
    },
    dispatch
  );

export const MembersProviderV2 = connect(
  null,
  mapDispatchToProps
)(withTranslation()(MembersProviderV2Draft));

export const useMembersContextV2 = () => {
  const context = React.useContext(MembersContextV2);
  if (!context) {
    throw new Error('useMembersContextV2 must be used within MembersProviderV2');
  }
  return context;
};
