import * as React from "react";
import spacetime from "spacetime";
import soft from "timezone-soft";
import timezoneList from '../constant/timezone-list';

function useTimezone(){
  const options = React.useMemo(() => {
    return Object.entries(timezoneList)
      .reduce((selectOptions, zone) => {
        const now = spacetime.now(zone[0]);
        const tz = now.timezone();
        const tzStrings = soft(zone[0]);

        let abbr = now.isDST() ? tzStrings[0].daylight?.abbr : tzStrings[0].standard?.abbr;
        let altName = now.isDST() ? tzStrings[0].daylight?.name : tzStrings[0].standard?.name;

        const min = tz.current.offset * 60;
        const hr =
          `${(min / 60) ^ 0}:` + (min % 60 === 0 ? "00" : Math.abs(min % 60));
        const prefix = `(GMT${hr.includes("-") ? hr : `+${hr}`}) ${zone[1]}`;
        const label = `${prefix}`;
        const formattedHr = `${((min / 60) ^ 0).toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false
        })}:` + (min % 60 === 0 ? "00" : Math.abs(min % 60));
        const gmtTz = `GMT${formattedHr.includes("-") ? formattedHr : `+${formattedHr}`}`;

        selectOptions.push({
          value: tz.name,
          label: label,
          offset: tz.current.offset,
          abbrev: abbr,
          altName: altName,
          gmtTz,
        });

        return selectOptions;
      }, [])
      .sort((a, b) => a.offset - b.offset)
  }, []);

  return [options];
}

export default useTimezone;
