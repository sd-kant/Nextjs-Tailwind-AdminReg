import * as React from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import chevronDown from '../../../assets/images/chevron-down.svg';
import avatar from '../../../assets/images/logo_round.png';
import addIcon from '../../../assets/images/plus-circle-fire.svg';

import clsx from 'clsx';
import style from './MemberTable.module.scss';
import DropdownMenu from "../../components/DropdownMenu";
import {useMembersContextV2} from "../../../providers/MembersProviderV2";
import Checkbox from "../../components/Checkbox";
import {useDashboardContext} from "../../../providers/DashboardProvider";
import {get} from "lodash";
import {useWidthContext} from "../../../providers/WidthProvider";
import BatteryV3 from "../../components/BatteryV3";
import {formatDevice4Digits, formatHeartRate} from "../../../utils/dashboard";

const MemberTable = (
  {
    t,
    metric,
    forceUpdate,
  }) => {
  const {
    paginatedMembers: members,
    setMember,
    setVisibleMemberModal,
    filter,
    setFilter,
    formatHeartCbt,
  } = useDashboardContext();
  const {width} = useWidthContext();
  const checkboxSize = React.useMemo(() => width < 768 ? 'sm' : 'md', [width]);
  const userNameLabel = React.useMemo(() => {
    return width < 768 ? t("name") : t("user name");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);
  const {selectedMembers, setSelectedMembers} = useMembersContextV2();
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
  const dropdownColumnsMap = {
    "alerts": t("alerts(24hr)"),
    "heatRisk": t("heat risk(24hrs)"),
    "connection": t("connection"),
  };

  const TableCell = (
    {
      value,
      member,
    }) => {
    const {
      stat,
      alert,
      numberOfAlerts,
      lastSyncStr,
      alertObj,
      connectionObj,
      invisibleAlerts,
      invisibleDeviceMac,
      invisibleBattery,
      invisibleHeatRisk,
      invisibleLastSync,
    } = member;
    const cellGray = ["1", "2", "7", "8"].includes(connectionObj?.value?.toString()) ? style.NoConnection : null;

    switch (value) {
      case "connection":
        return (
          <td className={clsx(style.TableCell, cellGray)}>
            <div className={clsx(style.Device)}>
              {
                !invisibleDeviceMac && formatDevice4Digits(stat?.deviceId) ?
                  <span>
                  {formatDevice4Digits(stat?.deviceId)}
                  </span> : null
              }
              <span>{connectionObj?.label}
              </span>
              {
                !invisibleBattery ?
                  <BatteryV3
                    percent={stat?.batteryPercent}
                    charging={stat?.chargingFlag}
                  /> : null
              }
            </div>
          </td>
        );
      case "heatRisk":
        return (
          <td className={clsx(style.TableCell)}>
            {
              !invisibleHeatRisk &&
              <div className={clsx(style.Device, cellGray)}>
                <span className={clsx('font-bold')}>
                  {alertObj?.label}
                </span>
                {
                  alertObj?.value?.toString() !== "5" &&
                    <React.Fragment>
                      <span>
                        {formatHeartCbt(alert?.heartCbtAvg)}{metric ? '°C' : '°F'}&nbsp;&nbsp;&nbsp;{formatHeartRate(alert?.heartRateAvg)} BPM
                      </span>
                      <span>
                        {alert?.utcTs ? new Date(alert?.utcTs).toLocaleString([], {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : ''}
                      </span>
                    </React.Fragment>
                }
              </div>
            }
          </td>
        );
      case "alerts":
        return (
          <td className={clsx(style.TableCell, cellGray)}>
            {invisibleAlerts ? "" : (numberOfAlerts > 0 ? `${numberOfAlerts} Alerts` : `No Alerts`)}
          </td>
        );
      case "heatSusceptibility":
        return (
          <td className={clsx(style.TableCell, cellGray)}>
            {/*{member.heatSusceptibility}*/}
          </td>
        );
      case "lastDataSync":
        return (
          <td className={clsx(style.TableCell, cellGray)}>
            {
              !invisibleLastSync ? lastSyncStr : ""
            }
          </td>
        );
      default:
        return null;
    }
  }

  const renderRow = (member) => {
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
    } else if (connectionValue?.toString() === "4") {
      badgeColorStyle = style.Yellow;
    }
    const userNameGray = ["1"].includes(connectionValue?.toString()) ? style.NoConnection : null;

    return (
      <tr
        className={clsx(style.TableRow, style.TableCommonRow)} key={`member-${member.userId}`}
        onClick={() => {
          setVisibleMemberModal(true);
          setMember(member);
        }}
      >
        <td className={clsx(style.TableCell, style.UserName, userNameGray)}>
          <div className={clsx(style.InnerWrapper)}>
            <div className={clsx(style.Badge, badgeColorStyle)}/>
            <div style={{marginTop: '20px'}}>
              <Checkbox
                size={checkboxSize}
                checked={checked}
                setChecked={() => {
                  if (checked) {
                    const temp = JSON.parse(JSON.stringify(selectedMembers ?? []));
                    temp.splice(index, 1);
                    setSelectedMembers(temp);
                  } else {
                    setSelectedMembers([...selectedMembers, member]);
                  }
                }}
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
              /> : null
          ))
        }
        {
          visibleColumns?.length < (Object.keys(columnsMap)?.length + 1) &&
          <td className={clsx(style.TableCell)}>

          </td>
        }
      </tr>
    );
  };
  const items3 = header => ([
    {
      title: t("max to min"),
      action: () => {
        setFilter({alerts: 1});
      },
      highlight: filter.alerts === 1,
    },
    {
      title: t('min to max'),
      action: () => {
        setFilter({alerts: 2});
      },
      highlight: filter.alerts === 2,
    },
    {
      title: t('remove'),
      action: () => {
        setVisibleColumns(prevState => prevState.filter(it => it !== header));
        forceUpdate();
      },
    },
  ]);
  const items4 = header => ([
    {
      title: t("risk to safe"),
      action: () => {
        setFilter({heatRisk: 1});
      },
      highlight: filter.heatRisk === 1,
    },
    {
      title: t('safe to risk'),
      action: () => {
        setFilter({heatRisk: 2});
      },
      highlight: filter.heatRisk === 2,
    },
    {
      title: t('remove'),
      action: () => {
        setVisibleColumns(prevState => prevState.filter(it => it !== header));
        forceUpdate();
      },
    },
  ]);
  const items5 = header => ([
    {
      title: t("connected"),
      action: () => {
        setFilter({connection: 1});
      },
      highlight: filter.connection === 1,
    },
    {
      title: t('not connected'),
      action: () => {
        setFilter({connection: 2});
      },
      highlight: filter.connection === 2,
    },
    {
      title: t('remove'),
      action: () => {
        setVisibleColumns(prevState => prevState.filter(it => it !== header));
        forceUpdate();
      },
    },
  ]);
  const items6 = () => ([
    {
      title: t("a - z"),
      action: () => {
        setFilter({username: 1});
      },
      highlight: filter.username === 1,
    },
    {
      title: t('z - a'),
      action: () => {
        setFilter({username: 2});
      },
      highlight: filter.username === 2,
    },
  ]);
  const items1 = header => ([
    {
      title: t("most recent"),
      action: () => {
        setFilter({lastSync: 1});
      },
      highlight: filter.lastSync === 1,
    },
    {
      title: t('oldest'),
      action: () => {
        setFilter({lastSync: 2});
      },
      highlight: filter.lastSync === 2,
    },
    {
      title: t('remove'),
      action: () => {
        setVisibleColumns(prevState => prevState.filter(it => it !== header));
        forceUpdate();
      },
    },
  ]);
  const items2 = header => ([
    {
      title: t("high to low"),
      action: () => {
      },
    },
    {
      title: t('low to high'),
      action: () => {
      },
    },
    {
      title: t('remove'),
      action: () => {
        setVisibleColumns(prevState => prevState.filter(it => it !== header));
        forceUpdate();
      },
    },
  ]);
  const items = value => {
    switch (value) {
      case "alerts":
        return items3("alerts");
      case "heatRisk":
        return items4("heatRisk");
      case "connection":
        return items5("connection");
      case "heatSusceptibility":
        return items2("heatSusceptibility");
      case "lastDataSync":
        return items1("lastDataSync");
      default:
        break;
    }
  }
  const addMenuItems = () => {
    const ret = [];
    Object.keys(columnsMap).forEach(it => {
      if (!visibleColumns.includes(it)) {
        ret.push(
          {
            title: columnsMap[it],
            action: () => {
              setVisibleColumns(prevState => [...prevState, it]);
              forceUpdate();
            }
          },
        );
      }
    });
    return ret;
  }

  const HeaderCell = (
    {
      value,
      label,
    }) => {
    return (
      <td className={clsx(style.TableHeaderCell)}>
        <span
          className={clsx(style.TableHeaderCellSpan)}
        >
          {label}
        </span>
        <DropdownMenu
          title={dropdownColumnsMap[value]}
          icon={
            <div className={clsx(style.ChevronWrapper)}>
              <img className={clsx(style.ChevronIcon)} src={chevronDown} alt="down"/>
            </div>
          }
          items={items(value)}
        />
      </td>
    )
  }

  return (
    <table className={clsx(style.Table)}>
      <thead className={clsx(style.TableHeader)}>
      <tr className={clsx(style.TableHeaderRow, style.TableCommonRow)}>
        <td className={clsx(style.TableHeaderCell, style.UserNameHeader)}>
          {/*<Checkbox/>*/}
          <span
            className={clsx(style.TableHeaderCellSpan)}
          >{userNameLabel}</span>
          <DropdownMenu
            title={userNameLabel}
            icon={
              <div className={clsx(style.ChevronWrapper)}>
                <img className={clsx(style.ChevronIcon)} src={chevronDown} alt="down"/>
              </div>
            }
            items={items6()}
          />
        </td>
        {
          Object.keys(columnsMap).map((header, index) => (
            visibleColumns.includes(header) ?
              <HeaderCell
                label={columnsMap[header]}
                value={header}
                key={`header-${index}`}
              /> : null
          ))
        }
        {
          visibleColumns?.length < (Object.keys(columnsMap)?.length + 1) &&
          <td className={clsx(style.TableHeaderCell)}>
            <DropdownMenu
              title={t('add columns')}
              icon={
                <img src={addIcon} alt="add column"/>
              }
              items={addMenuItems()}
            />
          </td>
        }
      </tr>
      </thead>

      <tbody>
      {
        members?.map(member => renderRow(member))
      }
      </tbody>
    </table>
  )
};

const mapStateToProps = (state) => ({
  metric: get(state, 'ui.metric'),
});

export default connect(
  mapStateToProps,
  null,
)(withTranslation()(MemberTable));
