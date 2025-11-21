import React from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div
        className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative mx-auto my-6 w-auto max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
        {/*content*/}
        <div className="relative flex w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-none focus:outline-none">
          {/*header*/}
          <div className="flex items-start justify-between rounded-t border-b border-solid border-gray-200 p-5">
            {title && <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>}
            <button
              className="ml-auto border-0 bg-transparent p-1 text-3xl font-semibold leading-none text-black opacity-50 outline-none focus:outline-none"
              onClick={onClose}
            >
              <span className="block h-6 w-6 bg-transparent text-2xl text-black opacity-50 outline-none focus:outline-none">
                ×
              </span>
            </button>
          </div>
          {/*body*/}
          <div className="relative flex-auto p-6">{children}</div>
          {/*footer - if needed, can be added here*/}
        </div>
      </div>
    </div>,
    document.body // Portal to body to avoid z-index issues
  );
};

export default Modal;
