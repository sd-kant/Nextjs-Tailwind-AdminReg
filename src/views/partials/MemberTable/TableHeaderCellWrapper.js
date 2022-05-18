import * as React from "react";
import {useDashboardContext} from "../../../providers/DashboardProvider";
import TableHeaderCell from "./TableHeaderCell";
import {useTranslation} from "react-i18next";

const TableHeaderCellWrapper = (
  {
    value,
    label,
    items,
  }) => {
  const {t} = useTranslation();
  const {columnStats, filter} = useDashboardContext();
  const formattedLabel = React.useMemo(() => {
    let ret = '';
    switch (value) {
      case "connection":
        if (filter.connection?.toString() === "1") {
          ret = `${t("connected")} (${columnStats.connectedUsers})`;
        } else if (filter.connection?.toString() === "2") {
          ret = `${t('not connected')} (${columnStats.notConnectedUsers})`;
        } else {
          ret = label;
        }
        break;
      case "heatRisk":
        if (filter.heatRisk?.toString() === "1") {
          ret = `${t("at risk")} (${columnStats.atRiskUsers})`;
        } else if (filter.heatRisk?.toString() === "2") {
          ret = `${t("safe")} (${columnStats.safeUsers})`;
        } else {
          ret = label;
        }
        break;
      case "alerts":
        if (["1", "2"].includes(filter.alerts?.toString())) {
          ret = `${label} (${columnStats.totalAlerts})`;
        } else {
          ret = label;
        }
        break;
      case "heatSusceptibility":
      case "lastDataSync":
      default:
        ret = label;
    }
    return ret;
  }, [columnStats, label, value, filter, t]);
  const hideChevron = React.useMemo(() => {
    let ret = false;
    switch (value) {
      case "connection":
        if (["1", "2"].includes(filter.connection?.toString())) ret = true;
        break;
      case "heatRisk":
        if (["1", "2"].includes(filter.heatRisk?.toString())) ret = true;
        break;
      case "alerts":
        if (["1", "2"].includes(filter.alerts?.toString())) ret = true;
        break;
      default:
        ret = false;
    }
    return ret;
  }, [value, filter]);

  return (
    <TableHeaderCell
      value={value}
      label={formattedLabel}
      items={items}
      hideChevron={hideChevron}
    />
  )
}

export default TableHeaderCellWrapper;
