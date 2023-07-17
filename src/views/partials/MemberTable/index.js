import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import clsx from 'clsx';
import style from './MemberTable.module.scss';
import { useDashboardContext } from '../../../providers/DashboardProvider';
import TableRow from './TableRow';
import TableHeader from './TableHeader';
import MemberDetail from '../../modals/MemberDetail';
import { UserSubscriptionProvider } from '../../../providers/UserSubscriptionProvider';

const MemberTable = ({ t, forceWidthUpdate }) => {
  const {
    paginatedMembers: members,
    member,
    visibleMemberModal,
    setVisibleMemberModal
  } = useDashboardContext();
  const storedVisibleColumns = localStorage.getItem('visibleColumns');
  const parsedVisibleColumns = storedVisibleColumns ? JSON.parse(storedVisibleColumns) : null;
  const validVisibleColumns = parsedVisibleColumns ?? ['name', 'connection', 'heatRisk', 'alerts'];
  const [visibleColumns, setVisibleColumns] = React.useState(validVisibleColumns);
  React.useEffect(() => {
    localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);
  const columnsMap = {
    connection: t('connection'),
    heatRisk: t('heat risk'),
    alerts: t('alerts'),
    heatSusceptibility: t('heat susceptibility'),
    lastDataSync: t('last data sync')
  };

  React.useEffect(() => {
    forceWidthUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(members.length)]);

  return (
    <>
      {members?.length > 0 ? (
        <table className={clsx(style.Table)}>
          <TableHeader
            columnsMap={columnsMap}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
            forceWidthUpdate={forceWidthUpdate}
          />

          <tbody>
            {members?.map((member, key) => (
              <TableRow
                member={member}
                key={`member-${key}-${member.userId}`}
                visibleColumns={visibleColumns}
                columnsMap={columnsMap}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <div className="font-heading-small text-capitalize mt-25">
          <span>{t('no matches found')}</span>
        </div>
      )}

      {visibleMemberModal && (
        <UserSubscriptionProvider>
          <MemberDetail
            data={member}
            open={visibleMemberModal}
            closeModal={() => setVisibleMemberModal(false)}
          />
        </UserSubscriptionProvider>
      )}
    </>
  );
};

const mapStateToProps = () => ({});

export default connect(mapStateToProps, null)(withTranslation()(React.memo(MemberTable)));
