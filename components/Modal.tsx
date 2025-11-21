import React from 'react';
import ReactDOM from 'react-dom';

/**
 * @file components/Modal.tsx
 * @brief Reusable Modal component for displaying overlay content.
 *
 * This component provides a flexible and accessible modal dialog solution,
 * using React Portals to render its content outside the normal DOM hierarchy,
 * preventing z-index issues and ensuring proper overlay behavior.
 */

/**
 * Props for the `Modal` component.
 */
interface ModalProps {
  isOpen: boolean; // Controls the visibility of the modal.
  onClose: () => void; // Callback function to close the modal.
  title?: string; // Optional title displayed in the modal header.
  children: React.ReactNode; // Content to be rendered inside the modal body.
}

/**
 * `Modal` is a functional React component that renders a modal dialog.
 * It uses `ReactDOM.createPortal` to render the modal directly into `document.body`,
 * which helps prevent z-index conflicts with other positioned elements.
 *
 * @param {ModalProps} props The properties passed to the component.
 * @returns {React.FC<ModalProps> | null} The modal component or null if not open.
 */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // If the modal is not open, render nothing.
  if (!isOpen) return null;

  // Use ReactDOM.createPortal to render the modal content directly into the document body.
  // This helps with layering contexts and ensures the modal appears above all other content.
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none"
      role="dialog" // ARIA role to identify the element as a dialog box.
      aria-modal="true" // Indicates that the dialog is modal and blocks content behind it.
      aria-labelledby={title ? 'modal-title' : undefined} // Associates the title with the dialog for accessibility.
    >
      {/* Backdrop overlay, closes the modal when clicked. */}
      <div
        className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true" // Hide from screen readers as it's a decorative overlay.
      ></div>
      {/* Modal content container, centered on the screen. */}
      <div className="relative mx-auto my-6 w-auto max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
        {/* Actual modal content, with white background and shadow. */}
        <div className="relative flex w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-none focus:outline-none">
          {/* Modal Header */}
          <div className="flex items-start justify-between rounded-t border-b border-solid border-gray-200 p-5">
            {/* Conditionally render the title with an ID for ARIA association. */}
            {title && <h3 id="modal-title" className="text-2xl font-semibold text-gray-800">{title}</h3>}
            {/* Close button for the modal. */}
            <button
              className="ml-auto border-0 bg-transparent p-1 text-3xl font-semibold leading-none text-black opacity-50 outline-none focus:outline-none"
              onClick={onClose}
              aria-label="Close modal" // Accessible label for the close button.
            >
              <span className="block h-6 w-6 bg-transparent text-2xl text-black opacity-50 outline-none focus:outline-none">
                ×
              </span>
            </button>
          </div>
          {/* Modal Body: where the `children` prop content is rendered. */}
          <div className="relative flex-auto p-6">{children}</div>
          {/* Optional Footer: can be added here if common footer actions are needed across modals. */}
        </div>
      </div>
    </div>,
    document.body // Portal the modal into the `body` element.
  );
};

export default Modal;