import * as React from 'react';
import { useMembersContextV2 } from '../../../providers/MembersProviderV2';
import clsx from 'clsx';
import style from './TableRow.module.scss';
import { useDashboardContext } from '../../../providers/DashboardProvider';
import Checkbox from '../../components/Checkbox';
import { useWidthContext } from '../../../providers/WidthProvider';
import avatar from '../../../assets/images/logo_round.png';
import TableCell from './TableCell';
import { DEVICE_CONNECTION_STATUS } from '../../../constant';
import { hasStatusValue } from '../../../utils';
import { sortMembers } from 'utils/dashboard';

const TableRow = ({ member, visibleColumns, columnsMap }) => {
  const { width } = useWidthContext();
  const checkboxSize = React.useMemo(() => (width < 768 ? 'sm' : 'md'), [width]);
  const { setVisibleMemberModal, setMember, hideCbtHR, filter } = useDashboardContext();
  const { selectedMembers, setSelectedMembers } = useMembersContextV2();
  const index = selectedMembers?.findIndex((it) => it.userId === member.userId);
  const checked = index !== -1;
  // const {
  //   alertObj: { value: alertValue },
  //   connectionObj: { value: connectionValue }
  // } = member;

  const getBadgeColorStyle = React.useCallback((_connectionValue, _alertValue) => {
    let badgeColorStyle = null;
    if (_connectionValue == DEVICE_CONNECTION_STATUS.CONNECTED) {
      if (['1', '2'].includes(_alertValue?.toString())) {
        badgeColorStyle = style.Red;
      } else {
        badgeColorStyle = style.Green;
      }
    } else if ([
        DEVICE_CONNECTION_STATUS.LIMITED_CONNECTION, 
        DEVICE_CONNECTION_STATUS.CHECK_DEVICE
      ].includes(_connectionValue)) {
      badgeColorStyle = style.Yellow;
    }
    return badgeColorStyle;
  }, []);

  const getUserNameGray = (_connectionValue) => {
    return hasStatusValue(_connectionValue, [DEVICE_CONNECTION_STATUS.NEVER_CONNECTION])
      ? style.NoConnection
      : null;
  };

  const handleSetChecked = React.useCallback(() => {
    if (checked) {
      const temp = JSON.parse(JSON.stringify(selectedMembers ?? []));
      temp.splice(index, 1);
      setSelectedMembers(temp);
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  }, [checked, index, member, selectedMembers, setSelectedMembers]);

  const members = React.useMemo(() => {
    let temp = [{ ...member, hasOtherDevices: member?.others?.length > 0, others: undefined }];
    if (member?.others?.length > 0) {
      member?.others?.forEach((element) => {
        temp.push({
          ...element,
          hasOtherDevices: false
        });
      });
      return sortMembers({ arrOrigin: temp, filter });
    } else return temp;
  }, [member, filter]);

  return (
    <>
      {members?.map((subMember, idx) => (
        <tr
          className={clsx(style.TableRow)}
          key={`member-${member.userId}-${idx}`}
          onClick={() => {
            setVisibleMemberModal(true);
            setMember(subMember);
          }}>
          <td className={clsx(style.TableCell, getUserNameGray(subMember?.connectionObj?.value))}>
            <div className={clsx(style.InnerWrapper)}>
              <div
                className={clsx(
                  style.Badge,
                  getBadgeColorStyle(subMember?.connectionObj?.value, subMember?.alertObj?.value)
                )}
              />
              {idx === 0 && (
                <div style={{ marginTop: '20px' }}>
                  <Checkbox size={checkboxSize} checked={checked} setChecked={handleSetChecked} />
                </div>
              )}
              <img src={avatar} className={clsx(style.Avatar)} alt="avatar" />
              <div style={{ textAlign: 'left' }}>
                <div>
                  <span>{member['firstName']}</span>
                </div>
                <div>
                  <span>{member['lastName']}</span>
                </div>
              </div>
            </div>
          </td>
          {Object.keys(columnsMap).map((header, index) =>
            visibleColumns.includes(header) ? (
              <TableCell
                value={header}
                key={`cell-${member.userId}-${index}`}
                member={subMember}
                hideCbtHR={hideCbtHR}
              />
            ) : null
          )}
          {visibleColumns?.length < Object.keys(columnsMap)?.length + 1 && (
            <td className={clsx(style.TableCell)} />
          )}
        </tr>
      ))}
    </>
  );
};

export default React.memo(TableRow);
