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
        if (filter.connection?.toString() === "2") {
          ret = `${t('not connected')} (${columnStats.notConnectedUsers})`;
        } else {
          ret = `${t("connected")} (${columnStats.connectedUsers})`;
        }
        break;
      case "heatRisk":
        if (filter.heatRisk?.toString() === "2") {
          ret = `${t("safe")} (${columnStats.safeUsers})`;
        } else {
          ret = `${t("at risk")} (${columnStats.atRiskUsers})`;
        }
        break;
      case "alerts":
        ret = `${label} (${columnStats.totalAlerts})`;
        break;
      case "heatSusceptibility":
      case "lastDataSync":
      default:
        ret = label;
    }
    return ret;
  }, [columnStats, label, value, filter, t]);
  const hideChevron = React.useMemo(() => ["connection", "heatRisk", "alerts"].includes(value), [value]);

  return (
    <TableHeaderCell
      value={value}
      label={formattedLabel}
      items={items}
      hideChevron={hideChevron}
    />
  )
};

export default TableHeaderCellWrapper;
