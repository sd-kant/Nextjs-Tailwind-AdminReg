import * as React from "react";
import clsx from "clsx";
import style from "./TableHeaderCell.module.scss";
import DropdownMenu from "../../components/DropdownMenu";
import {useTranslation} from "react-i18next";
import chevronDown from '../../../assets/images/chevron-down.svg';

const TableHeaderCell = (
  {
    value,
    label,
    items,
    hideChevron = false,
  }) => {
  const {t} = useTranslation();
  const dropdownColumnsMap = {
    "alerts": t("alerts(24hr)"),
    "heatRisk": t("heat risk(24hrs)"),
    "connection": t("connection"),
  };

  return (
    hideChevron ?
      <DropdownMenu
        title={dropdownColumnsMap[value]}
        icon={
          <td className={clsx(style.TableHeaderCell)}><span className={clsx(style.TableHeaderCellSpan)}>{label}</span>
          </td>
        }
        items={items(value)}
      /> :
      <td className={clsx(style.TableHeaderCell)}>
        <span className={clsx(style.TableHeaderCellSpan)}>{label}</span>
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
  );
}

export default React.memo(TableHeaderCell);
