import * as React from 'react';
import { MINUTE_OPTIONS } from '../constant';

function useTimeOptions() {
  const hourOptions = React.useMemo(() => {
    let i = 1;
    let options = [];
    while (i <= 12) {
      options.push(String(i).padStart(2, '0'));
      i++;
    }
    return options;
  }, []);

  return [hourOptions, MINUTE_OPTIONS];
}

export default useTimeOptions;
