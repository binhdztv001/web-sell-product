export default function Modal({ title, onClose, children }) {
  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal__box">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
