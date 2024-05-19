import React from "react";
import { useTranslation } from 'react-i18next';
import attachImage from 'assets/images/attach-svgrepo-com.png';
import phoneImage from 'assets/images/phone-call-svgrepo-com.png';
export default function GetHelp() {
    const { t } = useTranslation();
    const [toggleUI, setToggleUI] = React.useState(true);

    return (
        <div>
            <h1 className="tw-my-0 font-heading-large-44-auto">GetHelp</h1>
            <div className="tw-mt-2 sm:tw-mt-4 font-ubuntu-regular">
                <div className="">
                    {toggleUI?(
                        <>
                            <button className="sm:tw-text-[18px] tw-bg-neutral-500 tw-text-white tw-p-2 tw-cursor-pointer tw-border-0 tw-w-[70px] sm:tw-w-[150px] md:tw-w-[250px] lg:tw-w-[370px]">Email</button>
                            <button onClick={()=>setToggleUI(false)} className="sm:tw-text-[18px] tw-bg-neutral-950 tw-text-white tw-p-2 tw-cursor-pointer tw-border-0 tw-w-[70px] sm:tw-w-[150px] md:tw-w-[250px] lg:tw-w-[370px]">Call</button>
                        </>
                    ):(
                        <>
                            <button onClick={()=>setToggleUI(true)} className="sm:tw-text-[18px] tw-bg-neutral-950 tw-text-white tw-p-2 tw-cursor-pointer tw-border-0 tw-w-[70px] sm:tw-w-[150px] md:tw-w-[250px] lg:tw-w-[370px]">Email</button>
                            <button className="sm:tw-text-[18px] tw-bg-neutral-500 tw-text-white tw-p-2 tw-cursor-pointer tw-border-0 tw-w-[70px] sm:tw-w-[150px] md:tw-w-[250px] lg:tw-w-[370px]">Call</button>
                        </>
                    )}
                    
                    
                </div>
                {toggleUI?(
                    <div className="tw-text-[14px] sm:tw-text-[18px]  md:tw-text-[24px] tw-flex tw-flex-col tw-gap-2 tw-pt-2 sm:tw-p-2 md:tw-p-4 lg:tw-p-6 tw-w-[200px] sm:tw-w-[250px] md:tw-w-[300px] lg:tw-w-[350px]">
                        <div className="tw-flex tw-flex-col">
                            <label className="tw-mb-2">{t(`product name`)}*</label>
                            <input className="tw-w-full tw-text-[14px] sm:tw-text-[18px]  md:tw-text-[24px]" name="productName" type="text"/>
                        </div>
                        <div className="tw-flex tw-flex-col">
                            <label className="">{t(`name`)}*</label>
                            <span className="tw-whitespace-nowrap tw-mb-2 tw-text-[11px] sm:tw-text-[14px] md:tw-text-[16px]">{t(`first and last name of user exp issue`)}</span>
                            <input className="tw-w-full tw-text-[14px] sm:tw-text-[18px]  md:tw-text-[24px]" name="name" type="text"/>
                        </div>
                        <div className="tw-flex tw-flex-col">
                            <label className="tw-mb-2">{t(`contact name`)}*</label>
                            <input className="tw-w-full tw-text-[14px] sm:tw-text-[18px]  md:tw-text-[24px]" name="contactName" type="text"/>
                        </div>
                        <div className="tw-flex tw-flex-col">
                            <label className="tw-mb-2 tw-text-[12px] sm:tw-text-[16px]  md:tw-text-[21px]">{t(`describe your issue or question and any steps token`)}*</label>
                            <textarea rows="5" className="tw-w-full tw-text-[12px] sm:tw-text-[16px]  md:tw-text-[21px]" name="description"></textarea>
                        </div>
                        <div className="tw-flex tw-justify-start tw-gap-1 tw-items-center tw-text-orange-400 tw-mt-1 font-ubuntu-bold tw-text-[12px] sm:tw-text-[14px] md:tw-text-[16px] tw-cursor-pointer"><span>{t(`ATTACH`)}</span><img src={attachImage} alt="attach icon"/></div>
                        <button className="tw-bg-neutral-500 tw-border-0 tw-rounded-lg font-ubuntu-bold tw-text-white tw-px-4 tw-py-2 tw-text-[16px] sm:tw-text-[18px] md:tw-text-[20px] tw-mt-4 tw-w-[100px]">{t(`DONE`)}</button>
                    </div>
                ):(
                    <div className="tw-pt-2 sm:tw-p-2 md:tw-p-4 lg:tw-p-6">
                        <div className="tw-flex tw-justify-start tw-items-center tw-gap-2">
                            <img src={phoneImage} alt="phone icon"></img>
                            <span className="font-ubuntu-bold tw-text-[14px] sm:tw-text-[18px] md:tw-text-[24px]">(866)536-9360</span>
                        </div>
                    </div>
                )}
                
            </div>
        </div>
    )
}