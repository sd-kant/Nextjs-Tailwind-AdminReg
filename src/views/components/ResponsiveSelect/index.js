import * as React from "react";
import Select from "react-select"
import {useWidthContext} from "../../../providers/WidthProvider";

const ResponsiveSelect = (
  {
    className,
    isClearable = true,
    options = [],
    value = null,
    styles = null,
    placeholder = null,
    menuPortalTarget,
    menuPosition,
    isDisabled = false,
    maxMenuHeight,
    onChange = () => {},
  }) => {
  const {width} = useWidthContext();
  const [searchable, setSearchable] = React.useState(false);
  React.useEffect(() => {
    if (width < 768) {
      setSearchable(false);
    } else {
      setSearchable(true);
    }
  }, [width]);

  return (
    <Select
      className={className}
      isClearable={isClearable}
      isSearchable={searchable}
      options={options}
      value={value}
      styles={styles}
      isDisabled={isDisabled}
      placeholder={placeholder}
      maxMenuHeight={maxMenuHeight}
      menuPortalTarget={menuPortalTarget}
      menuPosition={menuPosition}
      onChange={onChange}
    />
  )
}

export default ResponsiveSelect;
