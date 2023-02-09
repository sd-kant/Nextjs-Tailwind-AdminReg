import * as React from "react";
import clsx from "clsx";
import style from "./ResultTableHeader.module.scss";
import {useAnalyticsContext} from "../../../providers/AnalyticsProvider";
import DropdownMenu from "../../components/DropdownMenu";
import chevronDown from '../../../assets/images/chevron-down.svg';

const ResultTableHeader = () => {
  const {headers, sortOptions} = useAnalyticsContext();

  return (
    <thead className={clsx(style.Header)}>
    <tr>
      {
        headers?.map((it, index) => {
          const visibleSort = Boolean(sortOptions[index]);
          return (
            <td
              className={clsx(style.HeaderCell, index === 0 ? style.FirstColumn : null)}
              key={`header-${index}`}
            >
              {it}
              {
                visibleSort &&
                <DropdownMenu
                  icon={
                    <div className={clsx(style.ChevronWrapper)}>
                      <img className={clsx(style.ChevronIcon)} src={chevronDown} alt="down"/>
                    </div>
                  }
                  title={sortOptions[index]?.title}
                  items={sortOptions[index]?.options}
                />
              }
            </td>
          )
        })
      }
    </tr>
    </thead>
  )
};

export default ResultTableHeader;
