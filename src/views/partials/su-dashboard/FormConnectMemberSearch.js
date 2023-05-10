import React from "react";
import clsx from "clsx";
import style from "./FormConnectMemberSearch.module.scss";
import {withTranslation} from "react-i18next";
import {useMembersContext} from "../../../providers/MembersProvider";
import SearchDropdown from "../../components/SearchDropdown";
import useClickOutSide from "../../../hooks/useClickOutSide";
import {useNavigate} from "react-router-dom";

const FormConnectMemberSearch = (
  {
    t,
  }) => {
  const {
    dropdownItems,
    keywordOnInvite,
    setKeywordOnInvite,
  } = useMembersContext();
  const navigate = useNavigate();

  const [visible, setVisible] = React.useState(false);
  const dropdownRef = React.useRef(null);
  useClickOutSide(dropdownRef, () => setVisible(false));

  const visibleDropdown = React.useMemo(() => {
    return visible && dropdownItems?.length > 0;
  }, [visible, dropdownItems?.length]);

  const handleItemClick = (id) => {

  };

  const handleCancel = () => {
    navigate("/connect/member/company");
  }

  return (
      <div className={clsx(style.Wrapper)}>
        <div className={clsx(style.Body)}>
          <div className={clsx(style.Row)}>
            <div
              className="d-flex flex-column"
            >
              <SearchDropdown
                ref={dropdownRef}
                renderInput={() => (
                  <input
                    className={clsx(style.Input, 'input mt-10 font-heading-small text-white')}
                    type="text"
                    value={keywordOnInvite}
                    placeholder={t("search user")}
                    onChange={e => setKeywordOnInvite(e.target.value)}
                    onClick={() => setVisible(true)}
                  />
                )}
                items={dropdownItems}
                visibleDropdown={visibleDropdown}
                onItemClick={handleItemClick}
              />
            </div>
          </div>

          <div className={clsx(style.Row, 'mt-25')}>
            <div
              className="d-flex flex-column"
            >
              <button
                className="active cursor-pointer button"
                type="button"
                onClick={handleCancel}
              >
                <span className='font-button-label text-white text-uppercase'>
                  {"cancel"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className={clsx(style.Footer)} />
      </div>
  )
};

export default withTranslation()(FormConnectMemberSearch);
