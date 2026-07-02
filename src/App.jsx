import { useState, useMemo } from "react";

const CLINIC_CONTEXT = {
  optometristes: 2,
  opticiens: 7,
  clientsParJourMin: 20,
  clientsParJourMax: 30,
  delaiLivraisonMin: 7,
  delaiLivraisonMax: 14,
};

const USAGE_PROFILES = {
  intensif: { label: "🔴 Intensif (à chaque client)", consoParJour: 25, criticite: 1.4, desc: "Utilisé pour la quasi-totalité des 20-30 clients/jour" },
  modere: { label: "🟠 Modéré (plusieurs fois/jour par le staff)", consoParJour: 8, criticite: 1.2, desc: "Utilisé régulièrement par les 9 employés cliniques" },
  occasionnel: { label: "🟡 Occasionnel (1-2x/jour)", consoParJour: 2, criticite: 1.0, desc: "Utilisé pour certains cas seulement" },
  rare: { label: "🟢 Rare (hebdomadaire/dépannage)", consoParJour: 0.3, criticite: 0.8, desc: "Usage ponctuel, dépannage" },
  manuel: { label: "✏️ Saisie manuelle", consoParJour: null, criticite: 1.0, desc: "Vous entrez votre propre estimation" },
};

function calcSeuilSecurite(consoParJour, criticite = 1.0) {
  if (!consoParJour || consoParJour <= 0) return 0;
  const baseSS = consoParJour * CLINIC_CONTEXT.delaiLivraisonMax;
  const tampon = consoParJour * (CLINIC_CONTEXT.delaiLivraisonMax - CLINIC_CONTEXT.delaiLivraisonMin) * 0.5;
  return Math.ceil((baseSS + tampon) * criticite);
}

const initialProducts = [
  { id: "PR001", code: "PR001A", name: "Nettoyant 148 N", category: "Produits de vente", photo: "🧴", prix: 20.75, cout: "med 5/10", minStock: 7, stock: 26, reorder: "Réduction vendeur", usageProfile: "modere", consoParJour: 8, unite: "fl", commentaire: "" },
  { id: "PR002", code: "PR002A", name: "1-Step par lot 1mth", category: "Produits de vente", photo: "💊", prix: 26.75, cout: "med 10.00", minStock: 1.5, stock: 11, reorder: "Réduction vendeur", usageProfile: "occasionnel", consoParJour: 2, unite: "fl", commentaire: "" },
  { id: "PR003", code: "PR003", name: "1-Drop par gouttes 15ml", category: "Produits de vente", photo: "💧", prix: 25.85, cout: "med 17.90", minStock: 1.5, stock: 41, reorder: "Réduction vendeur", usageProfile: "intensif", consoParJour: 25, unite: "fl", commentaire: "" },
  { id: "PR007A", code: "PR007A", name: "Rinçage thérapeutique", category: "Produits de vente", photo: "🫧", prix: 22.15, cout: "med 21.90", minStock: 2.5, stock: 12, reorder: "Verres réguliers", usageProfile: "occasionnel", consoParJour: 2, unite: "fl", commentaire: "" },
  { id: "N1025", code: "N1025", name: "Nettoyant Purevue 400 ml", category: "Produits de vente", photo: "🧼", prix: 26.95, cout: "Revue 5/35", minStock: 0, stock: 0, reorder: "Verres réguliers", usageProfile: "rare", consoParJour: 0.3, unite: "fl", commentaire: "Ne plus garder en stock" },
  { id: "NEW26", code: "NEW26", name: "Nettoyant Biotrue 420 ml", category: "Produits de vente", photo: "🧼", prix: 21.48, cout: "Revue 5/35", minStock: 0, stock: 0, reorder: "Verres réguliers", usageProfile: "rare", consoParJour: 0.3, unite: "fl", commentaire: "" },
  { id: "NT170", code: "NT170", name: "Hydrosept 120 ml", category: "Produits de vente", photo: "💉", prix: 21.88, cout: "Revue 1/1", minStock: 4, stock: 0, reorder: "Verres réguliers", usageProfile: "modere", consoParJour: 8, unite: "fl", commentaire: "" },
  { id: "CTO", code: "CTO", name: "Étui Galaxy", category: "Accessoires", photo: "🕶️", prix: 20.00, cout: "LuxeEtui 6.00", minStock: 0, stock: 8, reorder: "Prévenir Lunettier", usageProfile: "rare", consoParJour: 0.3, unite: "u", commentaire: "" },
  { id: "LOUP", code: "LOUP", name: "Lunettes à chambre humide", category: "Accessoires", photo: "🔭", prix: 199.00, cout: "Lux Revue 46.65", minStock: 0, stock: 3, reorder: "Prévenir Lunettier", usageProfile: "rare", consoParJour: 0.3, unite: "u", commentaire: "" },
  { id: "PINCH", code: "PINCH", name: "Pince Clip", category: "Accessoires", photo: "📎", prix: 0, cout: "Habituels 1.26", minStock: 1, stock: 4, reorder: "Prévenir Lunettier", usageProfile: "occasionnel", consoParJour: 2, unite: "u", commentaire: "" },
  { id: "CORD", code: "CORD", name: "Cordon sport", category: "Accessoires", photo: "🪢", prix: 4.45, cout: "Retirable 1.85", minStock: 0, stock: 8, reorder: "Prévenir Lunettier", usageProfile: "occasionnel", consoParJour: 2, unite: "u", commentaire: "" },
  { id: "LOUB", code: "LOUB", name: "Loupe lecture 7x", category: "Accessoires", photo: "🔍", prix: 199.00, cout: "Hilo 73.365", minStock: 0, stock: 1, reorder: "Prévenir Lunettier", usageProfile: "rare", consoParJour: 0.3, unite: "u", commentaire: "" },
  { id: "VCN", code: "VCN", name: "Ventouse", category: "Accessoires", photo: "🪠", prix: 4.96, cout: "Retirable 1.56", minStock: 0, stock: 8, reorder: "Prévenir Lunettier", usageProfile: "rare", consoParJour: 0.3, unite: "u", commentaire: "" },
].map(p => ({ ...p, seuilSecurite: calcSeuilSecurite(p.consoParJour, USAGE_PROFILES[p.usageProfile]?.criticite ?? 1.0) }));

const CATEGORIES = ["Tous", "Produits de vente", "Accessoires", "Soins"];
const STATUTS = ["Tous", "en stock", "faible stock", "en rupture"];
const statutConfig = {
  "en stock": { color: "#22c55e", bg: "#dcfce7", label: "✅ En stock" },
  "faible stock": { color: "#f59e0b", bg: "#fef3c7", label: "⚠️ Faible" },
  "en rupture": { color: "#ef4444", bg: "#fee2e2", label: "❌ Rupture" },
};

function getStatut(stock, min, seuil) {
  if (stock === 0) return "en rupture";
  if (seuil > 0 && stock <= seuil) return "faible stock";
  if (min > 0 && stock <= min) return "faible stock";
  return "en stock";
}

export default function App() {
  const [products, setProducts] = useState(
    initialProducts.map(p => ({ ...p, statut: getStatut(p.stock, p.minStock, p.seuilSecurite) }))
  );
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Tous");
  const [statutFilter, setStatutFilter] = useState("Tous");
  const [view, setView] = useState("tableau");
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ code: "", name: "", category: "Produits de vente", prix: "", cout: "", stock: 0, minStock: 0, usageProfile: "occasionnel", consoParJour: "", unite: "fl", commentaire: "", photo: "📦" });
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const q = search.toLowerCase();
      return (p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
        && (catFilter === "Tous" || p.category === catFilter)
        && (statutFilter === "Tous" || p.statut === statutFilter);
    });
    return [...list].sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      return av < bv ? (sortDir === "asc" ? -1 : 1) : av > bv ? (sortDir === "asc" ? 1 : -1) : 0;
    });
  }, [products, search, catFilter, statutFilter, sortField, sortDir]);

  const stats = useMemo(() => ({
    total: products.length,
    enStock: products.filter(p => p.statut === "en stock").length,
    faible: products.filter(p => p.statut === "faible stock").length,
    rupture: products.filter(p => p.statut === "en rupture").length,
    valeur: products.reduce((s, p) => s + (typeof p.prix === "number" ? p.prix * p.stock : 0), 0),
  }), [products]);

  const alerts = useMemo(() => products.filter(p => p.statut !== "en stock"), [products]);

  const handleSort = (f) => { if (sortField === f) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortField(f); setSortDir("asc"); } };

  const startEdit = (p) => { setEditingId(p.id); setEditVal({ stock: p.stock, prix: p.prix, commentaire: p.commentaire, usageProfile: p.usageProfile || "manuel", consoParJour: p.consoParJour ?? "" }); };

  const saveEdit = (id) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const conso = editVal.usageProfile === "manuel" ? Number(editVal.consoParJour) || 0 : USAGE_PROFILES[editVal.usageProfile].consoParJour;
      const criticite = USAGE_PROFILES[editVal.usageProfile]?.criticite ?? 1.0;
      const seuil = calcSeuilSecurite(conso, criticite);
      const updated = { ...p, ...editVal, stock: Number(editVal.stock), prix: editVal.prix === "" ? p.prix : Number(editVal.prix), consoParJour: conso, seuilSecurite: seuil };
      updated.statut = getStatut(updated.stock, updated.minStock, updated.seuilSecurite);
      return updated;
    }));
    setEditingId(null); showToast("✅ Produit mis à jour");
  };

  const adjustStock = (id, delta) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const s = Math.max(0, p.stock + delta);
      return { ...p, stock: s, statut: getStatut(s, p.minStock, p.seuilSecurite) };
    }));
  };

  const addProduct = () => {
    const conso = newProduct.usageProfile === "manuel" ? Number(newProduct.consoParJour) || 0 : USAGE_PROFILES[newProduct.usageProfile].consoParJour;
    const seuil = calcSeuilSecurite(conso, USAGE_PROFILES[newProduct.usageProfile]?.criticite ?? 1.0);
    const np = { ...newProduct, id: "P" + Date.now(), stock: Number(newProduct.stock), minStock: Number(newProduct.minStock), prix: Number(newProduct.prix), consoParJour: conso, seuilSecurite: seuil };
    np.statut = getStatut(np.stock, np.minStock, np.seuilSecurite);
    setProducts(prev => [...prev, np]);
    setShowAddModal(false);
    setNewProduct({ code: "", name: "", category: "Produits de vente", prix: "", cout: "", stock: 0, minStock: 0, usageProfile: "occasionnel", consoParJour: "", unite: "fl", commentaire: "", photo: "📦" });
    showToast("✅ Produit ajouté");
  };

  const deleteProduct = (id) => { if (window.confirm("Supprimer ce produit ?")) { setProducts(prev => prev.filter(p => p.id !== id)); showToast("🗑️ Supprimé"); } };

  const SortIcon = ({ field }) => <span style={{ opacity: sortField === field ? 1 : 0.3, fontSize: 10 }}>{sortField === field ? (sortDir === "asc" ? " ▲" : " ▼") : " ⬍"}</span>;

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#1e293b" }}>
      {toast && <div style={{ position: "fixed", top: 20, right: 20, background: "#1e293b", color: "#fff", padding: "12px 20px", borderRadius: 10, zIndex: 9999, fontSize: 14 }}>{toast}</div>}

      <div style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", padding: "24px 32px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#fff" }}>📦 Gestion d'Inventaire</h1>
            <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.85)", fontSize: 14 }}>Suivi automatique des stocks • 2 optométristes • 7 opticiens • 20-30 clients/jour</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {["tableau", "fiches", "alertes"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "8px 18px", borderRadius: 8, border: "2px solid rgba(255,255,255,0.5)", background: view === v ? "#fff" : "transparent", color: view === v ? "#ea580c" : "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                {v === "tableau" ? "📋 Tableau" : v === "fiches" ? "🗂️ Fiches" : `🔔 Alertes${alerts.length > 0 ? ` (${alerts.length})` : ""}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total articles", val: stats.total, icon: "📦", color: "#6366f1", bg: "#eef2ff" },
            { label: "En stock", val: stats.enStock, icon: "✅", color: "#22c55e", bg: "#dcfce7" },
            { label: "Stock faible", val: stats.faible, icon: "⚠️", color: "#f59e0b", bg: "#fef3c7" },
            { label: "Ruptures", val: stats.rupture, icon: "❌", color: "#ef4444", bg: "#fee2e2" },
            { label: "Valeur stock", val: `${stats.valeur.toFixed(0)}$`, icon: "💰", color: "#8b5cf6", bg: "#ede9fe" },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "16px 20px", border: `1px solid ${s.color}22` }}>
              <div style={{ fontSize: 24 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <input placeholder="🔍 Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, padding: "10px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none" }} />
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14 }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={statutFilter} onChange={e => setStatutFilter(e.target.value)} style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14 }}>
            {STATUTS.map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={() => setShowAddModal(true)} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#f97316", color: "#fff", fontWeight: 700, cursor: "pointer" }}>＋ Ajouter</button>
        </div>

        {view === "tableau" && (
          <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f97316", color: "#fff" }}>
                    {[["code","Code"],["photo",""],["name","Nom du produit"],["category","Catégorie"],["prix","Prix"],["stock","Stock"],["seuilSecurite","Seuil sécurité"],["statut","Statut"]].map(([f,l]) => (
                      <th key={f} onClick={() => handleSort(f)} style={{ padding: "14px 12px", textAlign: "left", fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                        {l}<SortIcon field={f} />
                      </th>
                    ))}
                    <th style={{ padding: "14px 12px", fontSize: 12, fontWeight: 700 }}>Ajuster</th>
                    <th style={{ padding: "14px 12px", fontSize: 12, fontWeight: 700 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const sc = statutConfig[p.statut] || statutConfig["en stock"];
                    const isEditing = editingId === p.id;
                    return (
                      <tr key={p.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: "#6366f1", fontFamily: "monospace" }}>{p.code}</td>
                        <td style={{ padding: "10px 8px", fontSize: 22, textAlign: "center" }}>{p.photo}</td>
                        <td style={{ padding: "10px 12px", fontWeight: 500, maxWidth: 200 }}>
                          <div>{p.name}</div>
                          {p.commentaire && <div style={{ fontSize: 11, color: "#94a3b8" }}>{p.commentaire}</div>}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#64748b", fontSize: 12 }}>{p.category}</td>
                        <td style={{ padding: "10px 12px", fontWeight: 700 }}>
                          {isEditing ? <input type="number" value={editVal.prix} onChange={e => setEditVal(v => ({ ...v, prix: e.target.value }))} style={{ width: 70, padding: "4px 8px", borderRadius: 6, border: "1.5px solid #f97316" }} />
                            : typeof p.prix === "number" ? `${p.prix.toFixed(2)}$` : p.prix}
                        </td>
                        <td style={{ padding: "10px 12px", fontWeight: 700, textAlign: "center" }}>
                          {isEditing ? <input type="number" value={editVal.stock} onChange={e => setEditVal(v => ({ ...v, stock: e.target.value }))} style={{ width: 60, padding: "4px 8px", borderRadius: 6, border: "1.5px solid #f97316", textAlign: "center" }} />
                            : <span style={{ color: p.stock === 0 ? "#ef4444" : p.stock <= p.seuilSecurite ? "#f59e0b" : "#22c55e", fontSize: 15 }}>{p.stock}</span>}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                          <span style={{ background: "#eef2ff", color: "#6366f1", padding: "3px 8px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>{p.seuilSecurite}</span>
                          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{USAGE_PROFILES[p.usageProfile]?.label?.split(" ")[0]} {p.consoParJour}/j</div>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ background: sc.bg, color: sc.color, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{sc.label}</span>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                            <button onClick={() => adjustStock(p.id, -1)} style={{ width: 28, height: 28, borderRadius: 6, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 700, color: "#ef4444" }}>−</button>
                            <button onClick={() => adjustStock(p.id, 1)} style={{ width: 28, height: 28, borderRadius: 6, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 700, color: "#22c55e" }}>+</button>
                          </div>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            {isEditing ? (
                              <>
                                <button onClick={() => saveEdit(p.id)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "#22c55e", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✓</button>
                                <button onClick={() => setEditingId(null)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "#e2e8f0", color: "#64748b", cursor: "pointer", fontSize: 12 }}>✕</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEdit(p)} style={{ padding: "4px 10px", borderRadius: 6, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 12, color: "#6366f1" }}>✏️</button>
                                <button onClick={() => deleteProduct(p.id)} style={{ padding: "4px 10px", borderRadius: 6, border: "1.5px solid #fee2e2", background: "#fff", cursor: "pointer", fontSize: 12, color: "#ef4444" }}>🗑️</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && <div style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>📭 Aucun produit trouvé</div>}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9", color: "#94a3b8", fontSize: 12 }}>{filtered.length} produit(s) sur {products.length}</div>
          </div>
        )}

        {view === "fiches" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {filtered.map(p => {
              const sc = statutConfig[p.statut] || statutConfig["en stock"];
              return (
                <div key={p.id} style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: `1px solid ${sc.color}33` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 36 }}>{p.photo}</span>
                    <span style={{ background: sc.bg, color: sc.color, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{sc.label}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "#6366f1", fontFamily: "monospace", marginBottom: 10 }}>{p.code}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>STOCK</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: sc.color }}>{p.stock}</div>
                    </div>
                    <div style={{ background: "#eef2ff", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>SEUIL</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#6366f1" }}>{p.seuilSecurite}</div>
                    </div>
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>PRIX</div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{typeof p.prix === "number" ? `${p.prix}$` : p.prix}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>{USAGE_PROFILES[p.usageProfile]?.label} • {p.consoParJour}/jour</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => adjustStock(p.id, -1)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1.5px solid #fee2e2", background: "#fff", cursor: "pointer", fontWeight: 700, color: "#ef4444" }}>− Retrait</button>
                    <button onClick={() => adjustStock(p.id, 1)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1.5px solid #dcfce7", background: "#fff", cursor: "pointer", fontWeight: 700, color: "#22c55e" }}>+ Ajout</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === "alertes" && (
          <div>
            {alerts.length === 0 ? (
              <div style={{ textAlign: "center", padding: 64, color: "#22c55e" }}>
                <div style={{ fontSize: 64 }}>🎉</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 16 }}>Tous les stocks sont OK !</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: "#fef3c7", borderRadius: 12, padding: "16px 20px", border: "1px solid #fcd34d", marginBottom: 8 }}>
                  <strong>⚠️ {alerts.length} produit(s) nécessite(nt) votre attention</strong>
                </div>
                {alerts.map(p => {
                  const sc = statutConfig[p.statut];
                  return (
                    <div key={p.id} style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", border: `1.5px solid ${sc.color}44`, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 32 }}>{p.photo}</span>
                      <div style={{ flex: 1, minWidth: 150 }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{p.code} · {p.reorder}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Seuil sécurité : {p.seuilSecurite} unités ({p.consoParJour}/jour × 14j max)</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: sc.color }}>{p.stock}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>EN STOCK</div>
                      </div>
                      <span style={{ background: sc.bg, color: sc.color, padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{sc.label}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => adjustStock(p.id, -1)} style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#ef4444", fontWeight: 700 }}>−</button>
                        <button onClick={() => adjustStock(p.id, 5)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: sc.color, color: "#fff", cursor: "pointer", fontWeight: 700 }}>+5</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 800 }}>➕ Nouveau produit</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { key: "code", label: "Code", type: "text", placeholder: "ex: PR999" },
                { key: "name", label: "Nom du produit", type: "text", placeholder: "Nom complet" },
                { key: "prix", label: "Prix de vente ($)", type: "number", placeholder: "0.00" },
                { key: "cout", label: "Coût", type: "text", placeholder: "ex: med 10.00" },
                { key: "stock", label: "Stock initial", type: "number", placeholder: "0" },
                { key: "unite", label: "Unité", type: "text", placeholder: "fl / u / kg..." },
                { key: "commentaire", label: "Commentaire", type: "text", placeholder: "Optionnel" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={newProduct[f.key]} onChange={e => setNewProduct(v => ({ ...v, [f.key]: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Fréquence d'usage</label>
                <select value={newProduct.usageProfile} onChange={e => setNewProduct(v => ({ ...v, usageProfile: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, background: "#fff" }}>
                  {Object.entries(USAGE_PROFILES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{USAGE_PROFILES[newProduct.usageProfile]?.desc}</div>
              </div>
              {newProduct.usageProfile === "manuel" && (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Consommation par jour</label>
                  <input type="number" placeholder="ex: 3" value={newProduct.consoParJour} onChange={e => setNewProduct(v => ({ ...v, consoParJour: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              )}
              <div style={{ background: "#eef2ff", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#4338ca" }}>
                📐 Seuil de sécurité calculé : <strong>{calcSeuilSecurite(newProduct.usageProfile === "manuel" ? Number(newProduct.consoParJour) || 0 : USAGE_PROFILES[newProduct.usageProfile]?.consoParJour, USAGE_PROFILES[newProduct.usageProfile]?.criticite ?? 1.0)}</strong> unités
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Catégorie</label>
                <select value={newProduct.category} onChange={e => setNewProduct(v => ({ ...v, category: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, background: "#fff" }}>
                  {["Produits de vente", "Accessoires", "Soins"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={addProduct} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "#f97316", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Ajouter le produit</button>
              <button onClick={() => setShowAddModal(false)} style={{ padding: "12px 20px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 600, color: "#64748b" }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
