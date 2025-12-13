import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseList } from './ExpenseList';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { LogOut, Calendar, Layers } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { CATEGORIES, CATEGORY_COLORS } from '../constants';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export const Dashboard = () => {
    const { currentUser, logout } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('month'); // 'month' or 'all'

    const [isOffline, setIsOffline] = useState(false);

    // Fetch data
    useEffect(() => {
        const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                // Check if data is from cache (offline)
                setIsOffline(snapshot.metadata.fromCache);

                const docs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setExpenses(docs);
                setLoading(false);
            },
            (error) => {
                console.error("Firestore Error:", error);
                if (error.code === 'permission-denied') {
                    alert("ERRO DE PERMISSÃO: O Firebase recusou a conexão. Verifique se as regras estão como 'allow read, write: if true;'.");
                } else if (error.code === 'not-found') {
                    alert("ERRO: Banco de dados não encontrado. Crie o 'Cloud Firestore' no console.");
                } else {
                    alert("Erro de Conexão: " + error.message);
                }
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    // Helper: Filter expenses by month if needed
    const filteredExpenses = viewMode === 'month'
        ? expenses.filter(e => e.date.startsWith(new Date().toISOString().slice(0, 7)))
        : expenses;

    const totalAmount = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

    // Analytics Logic (Always uses filteredExpenses for immediate charts)

    // By Category
    const byCategory = filteredExpenses.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {});

    const categoryData = {
        labels: Object.keys(byCategory),
        datasets: [{
            data: Object.values(byCategory),
            backgroundColor: Object.keys(byCategory).map(cat => CATEGORY_COLORS[cat] || '#94a3b8'),
            borderWidth: 0,
        }]
    };

    // By Person
    const byPerson = filteredExpenses.reduce((acc, curr) => {
        acc[curr.userName] = (acc[curr.userName] || 0) + curr.amount;
        return acc;
    }, {});

    const personData = {
        labels: Object.keys(byPerson),
        datasets: [{
            label: 'Spent',
            data: Object.values(byPerson),
            backgroundColor: '#f472b6',
            borderRadius: 6,
        }]
    };

    const chartOptions = {
        plugins: {
            legend: { position: 'bottom', labels: { color: '#94a3b8' } }
        },
        scales: {
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
        }
    };

    // Historical Analytics (Last 12 Months) - ALWAYS uses all expenses
    const [historyData, setHistoryData] = useState(null);

    useEffect(() => {
        const processHistory = () => {
            const last12Months = [];
            for (let i = 11; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                last12Months.push(d.toISOString().slice(0, 7)); // YYYY-MM
            }

            // Group by Month -> Category
            const dataByMonth = last12Months.reduce((acc, month) => {
                acc[month] = {};
                return acc;
            }, {});

            expenses.forEach(exp => {
                const month = exp.date.slice(0, 7);
                if (dataByMonth[month]) {
                    dataByMonth[month][exp.category] = (dataByMonth[month][exp.category] || 0) + exp.amount;
                }
            });

            const datasets = CATEGORIES.map(cat => ({
                label: cat,
                data: last12Months.map(m => dataByMonth[m][cat] || 0),
                backgroundColor: CATEGORY_COLORS[cat] || '#94a3b8',
                stack: 'Stack 0',
            }));

            setHistoryData({
                labels: last12Months,
                datasets: datasets
            });
        };

        if (expenses.length > 0) processHistory();
    }, [expenses]);

    const historyOptions = {
        plugins: {
            legend: { position: 'bottom', labels: { color: '#94a3b8' } },
        },
        scales: {
            y: {
                stacked: true,
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(255,255,255,0.05)' }
            },
            x: {
                stacked: true,
                ticks: { color: '#94a3b8' },
                grid: { display: false }
            }
        },
        responsive: true,
        maintainAspectRatio: false
    };

    return (
        <div className="container">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ marginBottom: '5px' }}>Despesas da Casa</h2>
                    <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                        Bem-vindo, {currentUser.name}
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        background: isOffline ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                        color: isOffline ? '#facc15' : '#4ade80',
                        fontSize: '0.85em',
                        border: `1px solid ${isOffline ? 'rgba(234, 179, 8, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`
                    }}>
                        {isOffline ? '⚠ Offline (Não sincronizado)' : '☁ Online (Sincronizado)'}
                    </div>
                    <button onClick={logout} className="glass-panel" style={{ padding: '8px 12px', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <LogOut size={16} /> Sair
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {/* Total Card */}
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9em' }}>
                            {viewMode === 'month' ? 'Total Este Mês' : 'Total Geral'}
                        </span>
                        <button
                            onClick={() => setViewMode(prev => prev === 'month' ? 'all' : 'month')}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: 'var(--color-text-muted)',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                title: viewMode === 'month' ? "Ver Total Geral" : "Ver Apenas Este Mês"
                            }}
                        >
                            {viewMode === 'month' ? <Layers size={16} /> : <Calendar size={16} />}
                        </button>
                    </div>
                    <span style={{ fontSize: '2.5em', fontWeight: '800', color: 'white' }}>
                        €{totalAmount.toFixed(2)}
                    </span>
                    <div style={{ fontSize: '0.8em', color: viewMode === 'month' ? '#4ade80' : '#facc15', marginTop: '5px' }}>
                        {viewMode === 'month' ? 'Exibindo apenas mês atual' : 'Exibindo todo o histórico'}
                    </div>
                </div>

                {/* Input Form */}
                <div style={{ gridRow: 'span 2' }}>
                    <ExpenseForm />
                </div>

                {/* Analytics 1: Category */}
                <div className="glass-panel" style={{ padding: '20px', minHeight: '300px' }}>
                    <h4 style={{ marginBottom: '15px' }}>Por Categoria ({viewMode === 'month' ? 'Mês' : 'Total'})</h4>
                    <Pie data={categoryData} options={{ plugins: { legend: { position: 'right', labels: { color: '#fff' } } } }} />
                </div>

                {/* Analytics 2: Person */}
                <div className="glass-panel" style={{ padding: '20px', minHeight: '300px' }}>
                    <h4 style={{ marginBottom: '15px' }}>Gastos por Pessoa ({viewMode === 'month' ? 'Mês' : 'Total'})</h4>
                    {Object.keys(byPerson).length > 0 ? (
                        <Bar data={personData} options={chartOptions} />
                    ) : (
                        <p className="text-muted">Sem dados ainda</p>
                    )}
                </div>

                {/* Analytics 3: History */}
                <div className="glass-panel" style={{ padding: '20px', minHeight: '300px', gridColumn: '1 / -1' }}>
                    <h4 style={{ marginBottom: '15px' }}>Histórico Global (Últimos 12 Meses)</h4>
                    <div style={{ height: '300px' }}>
                        {historyData ? (
                            <Bar data={historyData} options={historyOptions} />
                        ) : (
                            <p className="text-muted">Adicione despesas para ver o histórico</p>
                        )}
                    </div>
                </div>
            </div>

            {/* List */}
            <ExpenseList expenses={expenses} />
        </div>
    );
};
