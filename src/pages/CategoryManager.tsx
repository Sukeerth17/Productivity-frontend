import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Trash2, GripVertical, Plus, Star } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { categoryPath } from "@/lib/utils";
import { useAppState, CATEGORY_COLORS, getCategoryColorHex } from "@/lib/store";

export default function CategoryManager() {
  const store = useAppState({ categories: true, tasks: false, dashboardStats: false });
  const navigate = useNavigate();
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    store.addCategory({ name: newName.trim(), color: newColor, icon: "star" });
    setNewName("");
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) store.updateCategory(id, { name: editName.trim() });
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-xl mx-auto px-4 py-5 sm:px-6 sm:py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("/")} className="w-10 h-10 rounded-full border-game flex items-center justify-center btn-press">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold">Manage Categories</h1>
        </div>

        <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Active Categories</p>
        <div className="space-y-3 mb-8">
          {store.categories.map((cat) => {
            const colorHex = getCategoryColorHex(cat.color);
            return (
              <motion.div key={cat.id} className="card-game px-3 sm:px-4 py-4 flex items-center gap-2 sm:gap-3 cursor-pointer" layout onClick={() => navigate(categoryPath(cat.name))}>
                <GripVertical size={18} className="text-muted cursor-grab" />
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colorHex }}>
                  <Star size={16} className="text-foreground" />
                </div>
                {editingId === cat.id ? (
                  <input
                    className="flex-1 border-game rounded-inner px-3 py-1 font-heading font-bold bg-card"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleSaveEdit(cat.id)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(cat.id)}
                    autoFocus
                  />
                ) : (
                  <span className="flex-1 font-heading font-bold text-base sm:text-lg break-words">{cat.name}</span>
                )}
                <button
                  onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                  className="p-2 rounded-inner hover:bg-secondary transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => store.deleteCategory(cat.id)}
                  className="p-2 rounded-inner text-primary hover:bg-primary/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* New Category form */}
        <div className="card-game p-6 mb-6">
          <h3 className="font-heading font-bold text-lg mb-4">Design New Category</h3>

          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Category Name</p>
          <input
            className="w-full border-game rounded-inner px-4 py-3 font-body bg-card mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. Reading, Fitness..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />

          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Choose Color Code</p>
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-3 mb-4">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-transform ${newColor === c ? "scale-110 ring-4 ring-foreground" : "hover:scale-105"}`}
                style={{ backgroundColor: c }}
                onClick={() => setNewColor(c)}
              />
            ))}
          </div>

          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Icon</p>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full border-game flex items-center justify-center">
              <Star size={18} />
            </div>
            <span className="text-sm text-muted">Default icon</span>
          </div>
        </div>

        <motion.button
          className="w-full py-4 rounded-inner border-game bg-primary text-primary-foreground font-heading font-extrabold uppercase tracking-wider text-lg shadow-tactile btn-press flex items-center justify-center gap-2"
          onClick={handleCreate}
          whileTap={{ scale: 0.97 }}
        >
          <Plus size={20} strokeWidth={3} /> Create New Category
        </motion.button>
      </div>
    </div>
  );
}
