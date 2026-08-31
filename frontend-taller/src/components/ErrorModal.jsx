function ErrorModal({ mensaje, onClose }) {
  if (!mensaje) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box modal-alert">
        <h3>Ocurrió un error</h3>
        <p>{mensaje}</p>
        <button className="btn btn-primary" onClick={onClose}>Entendido</button>
      </div>
    </div>
  );
}

export default ErrorModal;