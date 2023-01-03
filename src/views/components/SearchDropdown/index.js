import React from "react";
import clsx from "clsx";
import style from "./SearchDropdown.module.scss";

const SearchDropdown = React.forwardRef((props, ref) => {
  const {
    items,
    visibleDropdown,
    renderInput = () => {},
    onItemClick = () => {},
  } = props;
  return (
    <React.Fragment>
      <div ref={ref} className={clsx(style.Wrapper)}>
        {renderInput()}
        {
          visibleDropdown &&
          <div className={clsx(style.Card)}>
            {
              items?.map((item, index) => (
                <div
                  key={`async-dropdown-item-${index}`}
                  className={clsx(style.Item)}
                  onClick={() => onItemClick(item.value)}
                >
                  <div>
                    <span className='text-black font-binary'>{item.title}</span>
                  </div>
                  <div>
                    <span className='text-black font-search'>{item.subtitle}</span>
                  </div>
                </div>
              ))
            }
          </div>
        }
      </div>
    </React.Fragment>
  )
});

SearchDropdown.displayName = 'SearchDropdown';

export default SearchDropdown;
