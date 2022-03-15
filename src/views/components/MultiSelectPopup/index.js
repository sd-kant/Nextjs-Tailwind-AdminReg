import React from "react";
import {useTranslation} from "react-i18next";
import style from "./MultiSelectPopup.module.scss";
import clsx from "clsx";
import Modal from "react-modal";
import Checkbox from "../Checkbox";
import Button from "../Button";
import {isEqual} from "lodash";
import closeIcon from "../../../assets/images/close.svg";

const MultiSelectPopup = (
  {
    label,
    options,
    value,
    onChange,
  }
) => {
  const {t} = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [checkedItems, setCheckedItems] = React.useState(value);
  React.useEffect(() => {
    setCheckedItems(value);
  }, [open, value]);
  const handleChange = (id, checked) => {
    if (checkedItems.some(it => it.value?.toString() === id?.toString())) {
      if (!checked) {
        setCheckedItems(checkedItems.filter(it => it.value?.toString() !== id?.toString()));
      }
    } else {
      if (checked) {
        setCheckedItems([...(checkedItems ?? []), options.find(it => it.value?.toString() === id?.toString())]);
      }
    }
  };

  return (
    <>
      <div
        className={clsx(style.Control, value?.length === 0 ? style.No : style.Yes, 'font-heading-small')}
        onClick={() => setOpen(true)}
      >
        <span>
          {label}
        </span>
      </div>
      <Modal
        isOpen={open}
        className={clsx(style.Modal)}
        overlayClassName={clsx(style.ModalOverlay)}
        onRequestClose={() => setOpen(false)}
        appElement={document.getElementsByTagName("body")}
      >
        <div className={clsx(style.Wrapper)}>
          <img
            className={clsx(style.CloseIcon)}
            src={closeIcon}
            alt="close icon"
            onClick={() => setOpen(false)}
          />
          <div>
            <div>
              <Checkbox
                label={t("select all")}
                checked={isEqual(options?.sort(), checkedItems?.sort())}
                setChecked={v => {
                  if (v) {
                    setCheckedItems(options);
                  } else {
                    setCheckedItems([]);
                  }
                }}
              />
            </div>
            {
              options?.map((option, index) => (
                <div key={`multi-selector-option-${index}`}>
                  <Checkbox
                    checked={checkedItems.some(it => it.value?.toString() === option.value?.toString())}
                    label={option.label}
                    setChecked={(v) => handleChange(option.value, v)}
                  />
                </div>
              ))
            }
          </div>
          <div className={clsx(style.Footer)}>
            <Button
              title={t('ok')}
              size={'sm'}
              onClick={() => {
                setOpen(false);
                onChange(checkedItems);
              }}
            />

            <Button
              title={t('cancel')}
              bgColor={'transparent'}
              size={'sm'}
              onClick={() => setOpen(false)}
            />
          </div>
        </div>
      </Modal>
    </>
  )
}

export default MultiSelectPopup;
