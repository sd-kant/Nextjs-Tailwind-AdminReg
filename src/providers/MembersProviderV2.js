import * as React from 'react';
import {connect} from "react-redux";
import {useDashboardContext} from "./DashboardProvider";
import {withTranslation} from "react-i18next";
import {setLoadingAction} from "../redux/action/ui";
import {bindActionCreators} from "redux";

const MembersContextV2 = React.createContext(null);

export const MembersProviderV2Draft = (
  {
    children,
  }) => {
  const [selectedMembers, setSelectedMembers] = React.useState([]);
  const {moveMember} = useDashboardContext();

  const handleMove = async teamId => {
    await moveMember(selectedMembers, teamId);
    setSelectedMembers([]);
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