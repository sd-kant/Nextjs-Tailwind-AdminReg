import React from "react";
import Button from "../Button";
import DropDownCard from "./DropdownButtonCard";
import style from "./DropdownButton.module.scss";
import clsx from 'clsx';
import chevronDown from "../../../assets/images/chevron-down.svg"

const DropdownButton = (
  {
    option = null,
    options = [],
    onClick = () => {},
    onClickOption = () => {},
  }) => {
  const [open, setOpen] = React.useState(false);
  const drop = React.useRef(null);

  function handleClick(e) {
    if (!e.target?.closest(`.${drop.current.className}`) && open) {
      setOpen(false);
    }
  }

  React.useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  });
  return (
    <div
      className={clsx(style.DropdownWrapper)}
      // ref={drop}
    >
      <Button
        bgColor={'gray'}
        borderColor={'gray'}
        dropdown={true}
        fullWidth={true}
        icon={<img src={chevronDown} alt="down"/>}
        title={options?.find(it => it.value?.toString() === option?.toString())?.label}
        onClick={onClick}
        drop={drop}
        onClickArrow={() => setOpen(open => !open)}
      />
      {
        open &&
        <DropDownCard
          option={option}
          data={options}
          setOpen={setOpen}
          onClickOption={onClickOption}
        />
      }
    </div>
  );
};

export default DropdownButton;