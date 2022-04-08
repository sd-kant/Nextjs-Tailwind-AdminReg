import * as React from "react";
import clsx from "clsx";
import style from "./ActivityLogs.module.scss";
import {useTranslation} from "react-i18next";
import {useUserSubscriptionContext} from "../../../providers/UserSubscriptionProvider";
import ActivityLog from "./ActivityLog";

const ActivityLogs = (
  {
    logs,
    gmt,
  }) => {
  const {t} = useTranslation();
  const {activitiesFilter, loading: logsLoading} = useUserSubscriptionContext();
/*todo translation*/
  return (
    <React.Fragment>
      {
        logsLoading ? (
          <div className={clsx(style.DataRow, style.Header, 'font-binary text-white')}>
                  <span
                    className={clsx('text-capitalize', style.Padding)}>Loading...</span>
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
                  <span className={clsx('font-binary', style.Padding)}>{t("datetime")}{gmt ? ` (${gmt})` : ''}</span>
                </div> :
                <div className={clsx(style.DataRow, style.Header, 'font-button-label text-orange')}>
                  <span
                    className={clsx('font-binary text-capitalize', style.Padding)}>No Activity Logs in {activitiesFilter?.label}</span>
                </div>
            }
            {
              logs?.map((item, index) => {
                return (
                  <ActivityLog gmt={gmt} item={item} key={`user-alert-${index}`}/>
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
