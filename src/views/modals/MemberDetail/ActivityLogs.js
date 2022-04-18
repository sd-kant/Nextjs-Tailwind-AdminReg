import * as React from "react";
import clsx from "clsx";
import style from "./ActivityLogs.module.scss";
import {useTranslation} from "react-i18next";
import {useUserSubscriptionContext} from "../../../providers/UserSubscriptionProvider";
import ActivityLog from "./ActivityLog";
import soft from "timezone-soft";

const ActivityLogs = (
  {
    logs,
    gmt,
  }) => {
  const {t} = useTranslation();
  const {activitiesFilter, loading: logsLoading} = useUserSubscriptionContext();
  const timezone = React.useMemo(() => {
    const a = soft(gmt)[0];
    if (a) {
      return {
        name: gmt,
        valid: true,
        displayName: a.standard?.abbr,
      };
    } else {
      return {
        name: gmt,
        valid: false,
        displayName: gmt,
      };
    }
  }, [gmt]);
  return (
    <React.Fragment>
      {
        logsLoading ? (
          <div className={clsx(style.DataRow, style.Header, 'font-binary text-white')}>
                  <span
                    className={clsx('text-capitalize', style.Padding)}>{t("loading")}</span>
          </div>
        ) : (
          <React.Fragment>
            {
              logs?.length > 0 ?
                <div className={clsx(style.DataRow, style.Header, 'font-button-label text-orange')}>
                  <span className={clsx('font-binary', style.Padding)}>{t("details")}</span>
                  <div>
                    <span className={clsx('font-binary', style.Padding)}>{t("cbt")}</span>
                    <span className={clsx('font-binary', style.Padding, 'ml-20')}>{t("hr")}</span>
                  </div>
                  <span className={clsx('font-binary', style.Padding)}>{t("datetime")}{gmt ? ` (${timezone.displayName})` : ''}</span>
                </div> :
                <div className={clsx(style.DataRow, style.Header, 'font-button-label text-orange')}>
                  <span
                    className={clsx('font-binary text-capitalize', style.Padding)}>{activitiesFilter?.noText}</span>
                </div>
            }
            {
              logs?.map((item, index) => {
                return (
                  <ActivityLog timezone={timezone} item={item} key={`user-alert-${index}`}/>
                )
              })
            }
          </React.Fragment>
        )
      }
    </React.Fragment>
  )
}

export default React.memo(ActivityLogs);
