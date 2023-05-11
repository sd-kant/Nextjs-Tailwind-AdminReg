import * as React from 'react';
import clsx from 'clsx';
import style from './ResultTableBody.module.scss';
import { useAnalyticsContext } from '../../../providers/AnalyticsProvider';

const ResultTableBody = () => {
  const { pageData } = useAnalyticsContext();

  return (
    <tbody>
      {pageData?.map((row, index) => (
        <tr key={`query-record-${index}`}>
          {row?.map((it, colIndex) => (
            <td
              className={clsx(style.Cell, colIndex === 0 ? style.FirstColumn : null)}
              key={`query-record-${index}-${colIndex}`}
            >
              {it}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

export default ResultTableBody;
