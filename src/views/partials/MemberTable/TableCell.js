import * as React from "react";
import {connect} from "react-redux";
import {get} from "lodash";
import {useUtilsContext} from "../../../providers/UtilsProvider";
import clsx from "clsx";
import style from "./TableCell.module.scss";
import {
  formatDevice4Digits,
  formatHeartRate
} from "../../../utils/dashboard";
import BatteryV3 from "../../components/BatteryV3";
import {useTranslation} from "react-i18next";

const TableCell = (
  {
    value,
    member,
    metric,
    hideCbtHR,
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
    heatSusceptibility,
  } = member;
  const {formatHeartCbt} = useUtilsContext();
  const cellGray = ["1", "2", "8"].includes(connectionObj?.value?.toString()) ? style.NoConnection : null;
  const {t} = useTranslation();

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
            <span>{connectionObj?.label}</span>
            {
              !invisibleBattery ?
                (stat?.batteryPercent >= 20 ?
                    <BatteryV3
                      percent={stat?.batteryPercent}
                      charging={stat?.chargingFlag}
                    /> : <span className={clsx('text-risk')}>{t('battery very low')}</span>
              ) : null
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
                  {
                    !hideCbtHR &&
                    <span>
                    {formatHeartCbt(alert?.heartCbtAvg)}{metric ? '°C' : '°F'}&nbsp;&nbsp;&nbsp;{formatHeartRate(alert?.heartRateAvg)} BPM
                  </span>
                  }
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
          {heatSusceptibility ?? ""}
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

const mapStateToProps = (state) => ({
  metric: get(state, 'ui.metric'),
});

export default connect(
  mapStateToProps,
  null,
)(React.memo(TableCell));
