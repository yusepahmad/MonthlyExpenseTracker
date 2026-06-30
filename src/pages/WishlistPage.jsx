import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useCashFlowPrediction } from "../hooks/useCashFlowPrediction";
import WishlistForm from "../components/wishlist/WishlistForm";
import WishlistItemCard from "../components/wishlist/WishlistItemCard";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";

export default function WishlistPage() {
  const { state, dispatch } = useApp();
  const { balance, netBurnPerDay, hasEnoughData } = useCashFlowPrediction();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  function openAddForm() {
    setEditingItem(null);
    setShowForm(true);
  }

  function openEditForm(item) {
    setEditingItem(item);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingItem(null);
  }

  function handleDelete() {
    dispatch({ type: "DELETE_WISHLIST_ITEM", payload: pendingDelete.id });
    setPendingDelete(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="font-display text-lg font-medium text-gray-900 dark:text-white">Wishlist</h2>
        <button
          onClick={openAddForm}
          className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 hover:scale-[1.03] shadow-glow"
        >
          + Tambah
        </button>
      </div>

      {state.wishlist.length === 0 ? (
        <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 shadow-soft animate-fade-in">
          <EmptyState message="Belum ada barang di wishlist." iconName="Gift" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.wishlist.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={item}
              balance={balance}
              netBurnPerDay={netBurnPerDay}
              hasEnoughData={hasEnoughData}
              onEdit={openEditForm}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={closeForm} title={editingItem ? "Edit Barang" : "Tambah Wishlist"}>
        <WishlistForm onSaved={closeForm} editingItem={editingItem} />
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Hapus dari wishlist?"
        message={pendingDelete ? `"${pendingDelete.name}" akan dihapus permanen.` : ""}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
