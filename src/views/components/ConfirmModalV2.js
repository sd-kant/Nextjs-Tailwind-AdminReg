import React from "react";
import {useTranslation} from "react-i18next";
import style from "./ConfirmModalV2.module.scss";
import clsx from "clsx";
import yesIcon from "../../assets/images/yes.svg";
import noIcon from "../../assets/images/no.svg";
import closeIcon from "../../assets/images/close.svg";

const ConfirmModalV2 = (
  {
    show,
    header,
    subheader,
    okText,
    cancelText,
    visibleCancel = true,
    visibleOk = true,
    onOk,
    onCancel,
  }) => {
  const {t} = useTranslation();

  return (
    <div className={clsx(style.Overlay, show ? "d-block" : "d-none")}>
      <div className={clsx(style.Modal, `z-index-2 ${show ? "d-block" : "d-none"}`)}>
        <img src={closeIcon} className={clsx(style.CloseIcon)} alt="close icon" onClick={onCancel}/>
        <div className={clsx(style.ModalHeader, "text-center")}>
        <span className={"font-modal-header text-white"}>
          {header}
        </span>
        </div>

        <div className={clsx(style.ModalSubheader, "mt-10 text-center")}>
        <span className="font-binary text-white">
          {subheader}
        </span>
        </div>

        <div className={clsx(style.ModalBody, "mt-60")}>
          <div className="d-flex justify-center">
            {
              visibleOk &&
              <div
                className={clsx(style.Tap, `cursor-pointer`)}
                onClick={onOk}
              >
                <img src={yesIcon} alt="male icon"/>

                <span className='font-binary mt-8 text-uppercase'>
                {okText ?? t("yes")}
              </span>
              </div>
            }
            {
              visibleCancel &&
              <div
                className={clsx(style.Tap, `cursor-pointer ml-40`)}
                onClick={onCancel}
              >
                <img src={noIcon} alt="female icon"/>

                <span className='font-binary mt-8 capitalize text-uppercase'>
                  {cancelText ?? t("no")}
              </span>
              </div>
            }
          </div>
        </div>

      </div>
    </div>
  )
}

export default ConfirmModalV2;