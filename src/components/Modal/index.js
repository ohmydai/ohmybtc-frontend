import React from 'react'
import { Dialog } from 'evergreen-ui'
import { createGlobalStyle } from 'styled-components'
import ModalFooter from './ModalFooter'

const ModalStyle = createGlobalStyle`
  .modal {
    background-color: black !important;
    border-radius: 14px;
    box-shadow: none !important;
    color: white;
    font-family: 'AvenirNext-Regular', sans-serif;
    font-size: 13px;
    padding: 30px;
  }
  
  .modal-bg::before {
    background-color: rgba(0, 0, 0, 0.4) !important;
  } 
`

const Modal = ({ isOpen, onClose, children }) => (
  <div>
    <ModalStyle />
    <Dialog
      isShown={isOpen}
      onCloseComplete={onClose}
      hasHeader={false}
      hasFooter={false}
      containerProps={{
        className: 'modal'
      }}
      preventBodyScrolling
      overlayProps={{
        className: 'modal-bg'
      }}
    >
      {({ close }) => (
        <div>
          {children}
          <ModalFooter>
            <button onClick={close}>
              Close
            </button>
          </ModalFooter>
        </div>
      )}
    </Dialog>
  </div>
)

export default Modal
