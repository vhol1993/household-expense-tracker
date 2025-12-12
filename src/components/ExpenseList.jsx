import React from 'react';
import { Trash2 } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

export const ExpenseList = ({ expenses }) => {
    const handleDelete = async (id) => {
        if (window.confirm('Apagar despesa?')) {
            await deleteDoc(doc(db, 'expenses', id));
        }
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
            <h3 style={{ marginBottom: '15px' }}>Despesas Recentes</h3>
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
                        {expenses.map(expense => (
                            <tr key={expense.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '12px 10px', fontSize: '0.9em' }}>{new Date(expense.date).toLocaleDateString()}</td>
                                <td style={{ padding: '12px 10px', fontWeight: '500' }}>{expense.description}</td>
                                <td style={{ padding: '12px 10px', fontSize: '0.9em', color: 'var(--color-text-muted)' }}>{expense.userName}</td>
                                <td style={{ padding: '12px 10px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.1)',
                                        fontSize: '0.8em'
                                    }}>
                                        {expense.category}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 'bold' }}>
                                    €{expense.amount.toFixed(2)}
                                </td>
                                <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                                    <button
                                        onClick={() => handleDelete(expense.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '5px' }}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
