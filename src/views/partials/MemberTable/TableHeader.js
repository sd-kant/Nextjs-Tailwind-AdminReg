import * as React from "react";
import {useTranslation} from "react-i18next";

import clsx from "clsx";
import style from "./TableHeader.module.scss";
import {useWidthContext} from "../../../providers/WidthProvider";
import DropdownMenu from "../../components/DropdownMenu";
import chevronDown from '../../../assets/images/chevron-down.svg';
import addIcon from '../../../assets/images/plus-circle-fire.svg';
import {useDashboardContext} from "../../../providers/DashboardProvider";
import TableHeaderCellWrapper from "./TableHeaderCellWrapper";

const TableHeader = (
  {
    columnsMap,
    visibleColumns,
    setVisibleColumns,
    forceWidthUpdate,
  }) => {
  const {t} = useTranslation();
  const {
    filter,
    setFilter,
  } = useDashboardContext();
  const {width} = useWidthContext();
  const userNameLabel = React.useMemo(() => {
    return width < 768 ? t("name") : t("user name");
  }, [width, t]);
  const items6 = React.useCallback(() => ([
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
  ]), [filter.username, setFilter, t]);

  const menuItems = React.useMemo(() => {
    const ret = [];
    Object.keys(columnsMap).forEach(it => {
      if (!visibleColumns.includes(it)) {
        ret.push(
          {
            title: columnsMap[it],
            action: () => {
              setVisibleColumns(prevState => [...prevState, it]);
              forceWidthUpdate();
            }
          },
        );
      }
    });
    return ret;
  }, [columnsMap, forceWidthUpdate, visibleColumns, setVisibleColumns]);

  const items3 = React.useCallback(header => ([
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
        forceWidthUpdate();
      },
    },
  ]), [filter.alerts, setFilter, forceWidthUpdate, setVisibleColumns, t]);

  const items4 = React.useCallback(header => ([
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
        forceWidthUpdate();
      },
    },
  ]), [filter.heatRisk, setFilter, forceWidthUpdate, setVisibleColumns, t]);

  const items5 = React.useCallback(header => ([
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
        forceWidthUpdate();
      },
    },
  ]), [filter.connection, setFilter, forceWidthUpdate, setVisibleColumns, t]);

  const items1 = React.useCallback(header => ([
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
        forceWidthUpdate();
      },
    },
  ]), [filter.lastSync, setFilter, forceWidthUpdate, setVisibleColumns, t]);

  const items2 = React.useCallback(header => ([
    {
      title: t("high to low"),
      action: () => {
        setFilter({heatSusceptibility: 1});
      },
      highlight: filter.heatSusceptibility === 1,
    },
    {
      title: t('low to high'),
      action: () => {
        setFilter({heatSusceptibility: 2});
      },
      highlight: filter.heatSusceptibility === 2,
    },
    {
      title: t('remove'),
      action: () => {
        setVisibleColumns(prevState => prevState.filter(it => it !== header));
        forceWidthUpdate();
      },
    },
  ]), [filter.heatSusceptibility, setFilter, forceWidthUpdate, setVisibleColumns, t]);

  const items = React.useCallback(value => {
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
  }, [items1, items2, items3, items4, items5]);

  return (
    <thead className={clsx(style.TableHeader)}>
    <tr className={clsx(style.TableHeaderRow)}>
      <td className={clsx(style.TableHeaderCell, style.UserNameHeader)}>
        {/*<Checkbox/>*/}
        <span className={clsx(style.TableHeaderCellSpan)}>{userNameLabel}</span>
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
            <TableHeaderCellWrapper
              label={columnsMap[header]}
              value={header}
              key={`header-${index}`}
              items={items}
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
            items={menuItems}
          />
        </td>
      }
    </tr>
    </thead>
  )
};

export default React.memo(TableHeader);
