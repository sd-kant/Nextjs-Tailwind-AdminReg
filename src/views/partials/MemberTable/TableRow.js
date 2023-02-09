import * as React from "react";
import {useMembersContextV2} from "../../../providers/MembersProviderV2";
import clsx from "clsx";
import style from "./TableRow.module.scss";
import {useDashboardContext} from "../../../providers/DashboardProvider";
import Checkbox from "../../components/Checkbox";
import {useWidthContext} from "../../../providers/WidthProvider";
import avatar from '../../../assets/images/logo_round.png';
import TableCell from "./TableCell";

const TableRow = (
  {
    member,
    visibleColumns,
    columnsMap,
  }) => {
  const {width} = useWidthContext();
  const checkboxSize = React.useMemo(() => width < 768 ? 'sm' : 'md', [width]);
  const {setVisibleMemberModal, setMember, hideCbtHR} = useDashboardContext();
  const {selectedMembers, setSelectedMembers} = useMembersContextV2();
  const index = selectedMembers?.findIndex(it => it.userId === member.userId);
  const checked = index !== -1;
  const {alertObj: {value: alertValue}, connectionObj: {value: connectionValue}} = member;
  let badgeColorStyle = null;
  if (connectionValue?.toString() === "3") {
    if (["1", "2"].includes(alertValue?.toString())) {
      badgeColorStyle = style.Red;
    } else {
      badgeColorStyle = style.Green;
    }
  } else if (["4", "7"].includes(connectionValue?.toString())) {
    badgeColorStyle = style.Yellow;
  }
  const userNameGray = ["1"].includes(connectionValue?.toString()) ? style.NoConnection : null;

  const handleSetChecked = React.useCallback(() => {
    if (checked) {
      const temp = JSON.parse(JSON.stringify(selectedMembers ?? []));
      temp.splice(index, 1);
      setSelectedMembers(temp);
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  }, [checked, index, member, selectedMembers, setSelectedMembers]);

  return (
    <tr
      className={clsx(style.TableRow)} key={`member-${member.userId}`}
      onClick={() => {
        setVisibleMemberModal(true);
        setMember(member);
      }}
    >
      <td className={clsx(style.TableCell, userNameGray)}>
        <div className={clsx(style.InnerWrapper)}>
          <div className={clsx(style.Badge, badgeColorStyle)}/>
          <div style={{marginTop: '20px'}}>
            <Checkbox
              size={checkboxSize}
              checked={checked}
              setChecked={handleSetChecked}
            />
          </div>
          <img src={avatar} className={clsx(style.Avatar)} alt="avatar"/>
          <div style={{textAlign: 'left'}}>
            <div><span>{member["firstName"]}</span></div>
            <div><span>{member["lastName"]}</span></div>
          </div>
        </div>
      </td>
      {
        Object.keys(columnsMap).map((header, index) => (
          visibleColumns.includes(header) ?
            <TableCell
              value={header}
              key={`cell-${member.userId}-${index}`}
              member={member}
              hideCbtHR={hideCbtHR}
            /> : null
        ))
      }
      {
        visibleColumns?.length < (Object.keys(columnsMap)?.length + 1) &&
        <td className={clsx(style.TableCell)}/>
      }
    </tr>
  )
};

export default React.memo(TableRow);
