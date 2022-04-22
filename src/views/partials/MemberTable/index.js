import * as React from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";

import clsx from 'clsx';
import style from './MemberTable.module.scss';
import {useDashboardContext} from "../../../providers/DashboardProvider";
import TableRow from "./TableRow";
import TableHeader from "./TableHeader";
import MemberDetail from "../../modals/MemberDetail";
import {UserSubscriptionProvider} from "../../../providers/UserSubscriptionProvider";

const MemberTable = (
  {
    t,
    forceWidthUpdate,
  }) => {
  const {
    paginatedMembers: members,
    member,
    visibleMemberModal,
    setVisibleMemberModal,
  } = useDashboardContext();
  const storedVisibleColumns = localStorage.getItem("visibleColumns");
  const parsedVisibleColumns = storedVisibleColumns ? JSON.parse(storedVisibleColumns) : null;
  const validVisibleColumns = parsedVisibleColumns ?? [
    "name",
    "connection",
    "heatRisk",
    "alerts",
  ];
  const [visibleColumns, setVisibleColumns] = React.useState(validVisibleColumns);
  React.useEffect(() => {
    localStorage.setItem("visibleColumns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);
  const columnsMap = {
    'connection': t("connection"),
    "heatRisk": t("heat risk"),
    "alerts": t('alerts'),
    "heatSusceptibility": t("heat susceptibility"),
    "lastDataSync": t("last data sync"),
  };

  return (
    <>
      <table className={clsx(style.Table)}>
        <TableHeader
          columnsMap={columnsMap}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          forceWidthUpdate={forceWidthUpdate}
        />

        <tbody>
        {
          members?.map(member => (
            <TableRow
              member={member}
              key={`member-${member.userId}`}
              visibleColumns={visibleColumns}
              columnsMap={columnsMap}
            />
          ))
        }
        </tbody>
      </table>
      {
        visibleMemberModal &&
          <UserSubscriptionProvider>
            <MemberDetail
              data={member}
              open={visibleMemberModal}
              closeModal={() => setVisibleMemberModal(false)}
            />
          </UserSubscriptionProvider>
      }
    </>
  )
};

const mapStateToProps = () => ({});

export default connect(
  mapStateToProps,
  null,
)(withTranslation()(React.memo(MemberTable)));
