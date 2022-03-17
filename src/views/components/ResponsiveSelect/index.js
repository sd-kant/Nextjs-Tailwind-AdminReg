import * as React from "react";
import Select from "react-select"
import {useWidthContext} from "../../../providers/WidthProvider";
import {withTranslation} from "react-i18next";

const ResponsiveSelect = (
  {
    writable = true,
    className,
    isClearable = false,
    options = [],
    value = null,
    styles = null,
    placeholder = null,
    menuPortalTarget,
    menuPosition,
    isDisabled = false,
    maxMenuHeight,
    onChange = () => {},
    t,
  }) => {
  const {width} = useWidthContext();
  const [searchable, setSearchable] = React.useState(false);
  React.useEffect(() => {
    if (width < 768) {
      setSearchable(false);
    } else {
      setSearchable(writable && true);
    }
  }, [width, writable]);

  return (
    <Select
      className={className}
      isClearable={isClearable}
      isSearchable={searchable}
      options={options}
      value={value}
      styles={styles}
      isDisabled={isDisabled}
      placeholder={placeholder ?? t("select")}
      maxMenuHeight={maxMenuHeight}
      menuPortalTarget={menuPortalTarget}
      menuPosition={menuPosition}
      onChange={onChange}
    />
  )
}

export default withTranslation()(ResponsiveSelect);
