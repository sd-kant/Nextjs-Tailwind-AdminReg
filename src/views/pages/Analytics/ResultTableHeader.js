import * as React from "react";
import clsx from "clsx";
import style from "./ResultTableHeader.module.scss";

const ResultTableHeader = () => {
  return (
    <thead>
    <tr>
      <td className={clsx(style.HeaderCell)}>
        Name
      </td>
      <td className={clsx(style.HeaderCell)}>
        Cbt
      </td>
    </tr>
    </thead>
  )
}

export default ResultTableHeader;
