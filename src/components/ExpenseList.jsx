import React, { useState } from 'react';
import { Trash2, Download, Pencil, Check, X } from 'lucide-react';
import { deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { CATEGORIES } from '../constants';

export const ExpenseList = ({ expenses }) => {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ amount: '', category: '' });

    const handleDelete = async (id) => {
        if (window.confirm('Apagar despesa?')) {
            await deleteDoc(doc(db, 'expenses', id));
        }
    };

    const startEdit = (expense) => {
        setEditingId(expense.id);
        setEditForm({ amount: expense.amount, category: expense.category });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ amount: '', category: '' });
    };

    const saveEdit = async (id) => {
        if (!editForm.amount || !editForm.category) return;

        try {
            const docRef = doc(db, 'expenses', id);
            await updateDoc(docRef, {
                amount: parseFloat(editForm.amount),
                category: editForm.category
            });
            setEditingId(null);
        } catch (error) {
            console.error("Error updating document: ", error);
            alert("Erro ao salvar edição");
        }
    };

    const handleExportCSV = () => {
        if (!expenses.length) return;

        const headers = ['Data', 'Descrição', 'Pessoa', 'Categoria', 'Valor'];
        const csvContent = [
            headers.join(','),
            ...expenses.map(e => [
                e.date,
                `"${e.description.replace(/"/g, '""')}"`, // Escape quotes
                e.userName,
                e.category,
                e.amount
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `despesas_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (expenses.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                Nenhuma despesa registrada este mês ainda.
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Despesas Recentes</h3>
                <button
                    onClick={handleExportCSV}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9em'
                    }}
                >
                    <Download size={16} /> Exportar CSV
                </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                            <th style={{ padding: '10px', color: 'var(--color-text-muted)', fontSize: '0.9em' }}>Data</th>
                            <th style={{ padding: '10px', color: 'var(--color-text-muted)', fontSize: '0.9em' }}>Descrição</th>
                            <th style={{ padding: '10px', color: 'var(--color-text-muted)', fontSize: '0.9em' }}>Pessoa</th>
                            <th style={{ padding: '10px', color: 'var(--color-text-muted)', fontSize: '0.9em' }}>Categoria</th>
                            <th style={{ padding: '10px', color: 'var(--color-text-muted)', fontSize: '0.9em', textAlign: 'right' }}>Valor</th>
                            <th style={{ padding: '10px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map(expense => {
                            const isEditing = editingId === expense.id;
                            return (
                                <tr key={expense.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px 10px', fontSize: '0.9em' }}>{new Date(expense.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px 10px', fontWeight: '500' }}>{expense.description}</td>
                                    <td style={{ padding: '12px 10px', fontSize: '0.9em', color: 'var(--color-text-muted)' }}>{expense.userName}</td>

                                    {/* Editable Category */}
                                    <td style={{ padding: '12px 10px' }}>
                                        {isEditing ? (
                                            <select
                                                className="input-field"
                                                value={editForm.category}
                                                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                                style={{ padding: '5px', fontSize: '0.9em' }}
                                            >
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.1)',
                                                fontSize: '0.8em'
                                            }}>
                                                {expense.category}
                                            </span>
                                        )}
                                    </td>

                                    {/* Editable Amount */}
                                    <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 'bold' }}>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                className="input-field"
                                                value={editForm.amount}
                                                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                                                style={{ width: '80px', padding: '5px', textAlign: 'right' }}
                                                step="0.01"
                                            />
                                        ) : (
                                            `€${expense.amount.toFixed(2)}`
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                                        {isEditing ? (
                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => saveEdit(expense.id)} className="btn-icon-success" title="Save">
                                                    <Check size={16} color="#4ade80" />
                                                </button>
                                                <button onClick={cancelEdit} className="btn-icon-danger" title="Cancel">
                                                    <X size={16} color="#ef4444" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => startEdit(expense)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '5px' }}
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '5px' }}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
