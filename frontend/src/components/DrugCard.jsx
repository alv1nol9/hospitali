import '../styles/DrugCard.css';

export default function DrugCard({ drug, currentUser, onDelete }) {
  const canEdit =
    currentUser &&
    (currentUser.role === 'admin' || currentUser.username === drug.owner);

  return (
    <div className="drug-card">
      <h3>{drug.name}</h3>
      <p>Qty: {drug.quantity}</p>
      <p>Min: {drug.min_threshold}</p>
      <p className="owner">Owner: {drug.owner}</p>
      {drug.low_stock && <p className="low-stock">Low stock</p>}
      {canEdit && (
        <div className="actions">
          <button onClick={() => onDelete && onDelete(drug.id)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
