import * as React from "react";

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
  const minuteOptions = ["00", "15", "30", "45"];

  return [hourOptions, minuteOptions];
}

export default useTimeOptions;
