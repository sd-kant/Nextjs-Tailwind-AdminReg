import * as React from "react";
import clsx from "clsx";
import style from "./ResultTableBody.module.scss";
import {useAnalyticsContext} from "../../../providers/AnalyticsProvider";

const ResultTableBody = () => {
  const {analytics} = useAnalyticsContext();

  return (
    <tbody>
    {
      analytics?.map(it =>
        <tr>
          <td className={clsx(style.Cell)}>
            {it.name}
          </td>

          <td className={clsx(style.Cell)}>
            {it.cbt}
          </td>
        </tr>
      )
    }
    </tbody>
  )
}

export default ResultTableBody;
