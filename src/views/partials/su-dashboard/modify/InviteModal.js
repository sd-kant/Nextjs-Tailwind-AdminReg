import React from 'react';
import Modal from 'react-modal';
import clsx from 'clsx';
import removeIcon from '../../../../assets/images/remove.svg';
import style from './InviteModal.module.scss';
import { withTranslation } from 'react-i18next';
import { useMembersContext } from '../../../../providers/MembersProvider';
import SearchDropdown from '../../../components/SearchDropdown';
import useClickOutSide from '../../../../hooks/useClickOutSide';

const InviteModal = ({ t, isOpen = false, onClose, onClickCreate }) => {
  const { dropdownItems, keywordOnInvite, setKeywordOnInvite, handleInviteClick } =
    useMembersContext();

  const [visible, setVisible] = React.useState(false);
  const dropdownRef = React.useRef(null);
  useClickOutSide(dropdownRef, () => setVisible(false));

  const visibleDropdown = React.useMemo(() => {
    return visible && dropdownItems?.length > 0;
  }, [visible, dropdownItems?.length]);
  const styleRef = React.useRef('');

  const disableScroll = () => {
    styleRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  };

  const enableScroll = () => {
    document.body.style.overflow = styleRef.current;
  };

  const handleItemClick = (id) => {
    handleInviteClick(id);
  };

  return (
    <Modal
      isOpen={isOpen}
      className={clsx(style.Modal)}
      overlayClassName={clsx(style.ModalOverlay)}
      appElement={document.getElementsByTagName('body')}
      onAfterOpen={disableScroll}
      onAfterClose={enableScroll}
      preventScroll={true}
    >
      <div className={clsx(style.Wrapper)}>
        <div className={clsx(style.RemoveIconWrapper)} onClick={onClose}>
          <img src={removeIcon} alt="remove icon" />
        </div>

        <div className={clsx(style.Header)}>
          <span className={'font-modal-header text-white'}>{t('invite team member')}</span>
        </div>
        <div className={clsx(style.User)}>
          <div className={clsx(style.UserRow)}>
            <div className="d-flex flex-column">
              <SearchDropdown
                ref={dropdownRef}
                renderInput={() => (
                  <input
                    className={clsx(style.Input, 'input mt-10 font-heading-small text-white')}
                    type="text"
                    value={keywordOnInvite}
                    placeholder={t('search user')}
                    onChange={(e) => setKeywordOnInvite(e.target.value)}
                    onClick={() => setVisible(true)}
                  />
                )}
                items={dropdownItems}
                visibleDropdown={visibleDropdown}
                onItemClick={handleItemClick}
              />
            </div>
          </div>

          <div className={clsx(style.UserRow, 'mt-25 text-center')}>
            <span className={'font-modal-header text-white text-capitalize'}>{t('or')}</span>
          </div>

          <div className={clsx(style.UserRow, 'mt-25')}>
            <div className="d-flex flex-column">
              <button
                className="active cursor-pointer button"
                type="button"
                onClick={onClickCreate}
              >
                <span className="font-button-label text-white text-uppercase">
                  {'create new team member'}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className={clsx(style.Footer)} />
      </div>
    </Modal>
  );
};

export default withTranslation()(InviteModal);
