import React, { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Loader2 } from 'lucide-react';

const CATEGORIES = ['Mercado', 'Contas', 'Lazer', 'Transporte', 'Saúde', 'Outros'];

export const ExpenseForm = () => {
    const { currentUser } = useAuth();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Mercado');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !description) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, 'expenses'), {
                amount: parseFloat(amount),
                description,
                category,
                date,
                userId: currentUser.id,
                userName: currentUser.name,
                createdAt: Timestamp.now()
            });
            // Reset form
            setAmount('');
            setDescription('');
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Falha ao salvar despesa");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--color-primary-text)' }}>Adicionar Nova Despesa</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em', color: 'var(--color-text-muted)' }}>Valor (€)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="input-field"
                        placeholder="0.00"
                        required
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em', color: 'var(--color-text-muted)' }}>Data</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="input-field"
                        required
                    />
                </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em', color: 'var(--color-text-muted)' }}>Descrição</label>
                <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="input-field"
                    placeholder="ex: Compras da semana no Tesco"
                    required
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em', color: 'var(--color-text-muted)' }}>Categoria</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            style={{
                                background: category === cat ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '0.85em',
                                transition: 'background 0.2s'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} />}
                Adicionar Despesa
            </button>
        </form>
    );
};
