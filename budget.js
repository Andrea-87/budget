// Storage temporaneo per la demo (in produzione useresti localStorage)
    let storedFiles = new Map();
    let allTransactions = [];
    let currentPeriod = 'all';
    let charts = {};

    // Inizializzazione al caricamento della pagina
    document.addEventListener('DOMContentLoaded', function() {
        loadStoredFiles();
        updateFilesList();
        if (storedFiles.size > 0) {
            showAllData();
        }
    });

    // Simula il caricamento dei file salvati (in produzione useresti localStorage)
    function loadStoredFiles() {
        // In un ambiente reale, qui caricheresti da localStorage
        const saved = localStorage.getItem('bankFiles');
        if (saved) {
             storedFiles = new Map(JSON.parse(saved));
        }
        
        // Per la demo, manteniamo i file in memoria durante la sessione
        console.log('Files loaded from memory storage');
    }

    // Salva un file (in produzione useresti localStorage)
    function saveFile(filename, content, transactions) {
        const fileData = {
            filename: filename,
            content: content,
            transactions: transactions,
            uploadDate: new Date().toISOString(),
            period: extractPeriodFromTransactions(transactions)
        };
        
        storedFiles.set(filename, fileData);
        
        // In un ambiente reale, qui salveresti in localStorage
        localStorage.setItem('bankFiles', JSON.stringify(Array.from(storedFiles.entries())));
        
        console.log('File saved to memory storage:', filename);
    }

    // Estrae il periodo dalle transazioni
    function extractPeriodFromTransactions(transactions) {
        if (transactions.length === 0) return [];
        
        const periods = new Set();
        transactions.forEach(t => {
            const date = t.date; // formato DD/MM/YYYY
            const monthYear = date.substring(3); // MM/YYYY
            periods.add(monthYear);
        });
        
        return Array.from(periods).sort();
    }

    // Elimina un file
    function deleteFile(filename) {
        if (confirm(`Sei sicuro di voler eliminare il file "${filename}"?`)) {
            storedFiles.delete(filename);
            localStorage.setItem('bankFiles', JSON.stringify(Array.from(storedFiles.entries())));
            updateFilesList();
            
            if (storedFiles.size === 0) {
                document.getElementById('results').classList.add('hidden');
            } else {
                showAllData();
            }
        }
    }

    // Aggiorna la lista dei file
    function updateFilesList() {
        const noFiles = document.getElementById('noFiles');
        const filesContainer = document.getElementById('filesContainer');
        const fileList = document.getElementById('fileList');
        
        if (storedFiles.size === 0) {
            noFiles.classList.remove('hidden');
            filesContainer.classList.add('hidden');
            return;
        }
        
        noFiles.classList.add('hidden');
        filesContainer.classList.remove('hidden');
        
        fileList.innerHTML = '';
        
        storedFiles.forEach((fileData, filename) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <div class="file-name">${filename}</div>
                    <div class="file-date">Caricato: ${new Date(fileData.uploadDate).toLocaleDateString('it-IT')}</div>
                    <div class="file-date">Periodi: ${fileData.period.join(', ')}</div>
                    <div class="file-date">Transazioni: ${fileData.transactions.length}</div>
                </div>
                <button class="delete-btn" onclick="deleteFile('${filename}')">🗑️</button>
            `;
            fileList.appendChild(fileItem);
        });
        
        updateMonthButtons();
    }

    // Aggiorna i bottoni dei mesi
    function updateMonthButtons() {
        const monthButtons = document.getElementById('monthButtons');
        monthButtons.innerHTML = '';
        
        const allPeriods = new Set();
        storedFiles.forEach(fileData => {
            fileData.period.forEach(period => allPeriods.add(period));
        });
        
        const sortedPeriods = Array.from(allPeriods).sort();
        
        sortedPeriods.forEach(period => {
            const button = document.createElement('button');
            button.className = 'month-button';
            button.textContent = period;
            button.onclick = () => showPeriodData(period);
            monthButtons.appendChild(button);
        });
    }

    // Mostra tutti i dati
    function showAllData() {
        currentPeriod = 'all';
        updateActiveButton();
        
        // Combina tutte le transazioni
        allTransactions = [];
        storedFiles.forEach(fileData => {
            allTransactions = allTransactions.concat(fileData.transactions);
        });
        
        // Ordina per data
        allTransactions.sort((a, b) => new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-')));
        
        document.getElementById('periodTitle').textContent = '📊 Tutti i Dati';
        document.getElementById('periodDescription').textContent = `${allTransactions.length} transazioni da ${storedFiles.size} file(s)`;
        
        if (allTransactions.length > 0) {
            updateAnalysis(allTransactions);
            document.getElementById('results').classList.remove('hidden');
        }
    }

    // Mostra dati per un periodo specifico
    function showPeriodData(period) {
        currentPeriod = period;
        updateActiveButton();
        
        // Filtra transazioni per il periodo
        const periodTransactions = [];
        storedFiles.forEach(fileData => {
            const filtered = fileData.transactions.filter(t => t.date.substring(3) === period);
            periodTransactions.push(...filtered);
        });
        
        periodTransactions.sort((a, b) => new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-')));
        
        document.getElementById('periodTitle').textContent = `📅 ${period}`;
        document.getElementById('periodDescription').textContent = `${periodTransactions.length} transazioni nel periodo selezionato`;
        
        if (periodTransactions.length > 0) {
            updateAnalysis(periodTransactions);
            document.getElementById('results').classList.remove('hidden');
        }
    }

    // Aggiorna il bottone attivo
    function updateActiveButton() {
        document.querySelectorAll('.month-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (currentPeriod === 'all') {
            document.querySelector('.month-button.all').classList.add('active');
        } else {
            const targetBtn = Array.from(document.querySelectorAll('.month-button')).find(btn => 
                btn.textContent === currentPeriod && !btn.classList.contains('all')
            );
            if (targetBtn) targetBtn.classList.add('active');
        }
    }

    // Funzione per categorizzare le transazioni
    function categorizeTransaction(description) {
        const desc = description.toLowerCase();
        
        if (desc.includes('caffe') || desc.includes('pizza') || desc.includes('supermercati') || 
            desc.includes('minimarket') || desc.includes('tortellin') || desc.includes('pasticceria')) {
            return 'Alimentari';
        }
        if (desc.includes('farmacia')) {
            return 'Salute';
        }
        if (desc.includes('bonifico') && desc.includes('affitto')) {
            return 'Affitto';
        }
        if (desc.includes('emolumenti') || desc.includes('cedole') || desc.includes('dividendi')) {
            return 'Stipendio/Investimenti';
        }
        if (desc.includes('pos') || desc.includes('carta')) {
            return 'Acquisti Vari';
        }
        if (desc.includes('prelievo')) {
            return 'Prelievi';
        }
        if (desc.includes('euronics') || desc.includes('leroy') || desc.includes('prenatal') || desc.includes('gabrielli')) {
            return 'Shopping';
        }
        if (desc.includes('tabaccheria')) {
            return 'Tabacchi';
        }
        if (desc.includes('park')) {
            return 'Parcheggi';
        }
        if (desc.includes('bonifico')) {
            return 'Bonifici';
        }
        if (desc.includes('findomestic') || desc.includes('sepa')) {
            return 'Finanziamenti';
        }
        
        return 'Altro';
    }

    // Funzione per parsare il file
    function parseTransactionFile(content) {
        const lines = content.split('\n');
        const parsedTransactions = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Cerca le linee che iniziano con un numero (le transazioni)
            const match = line.match(/^(\d+)\s+(\d{2}\/\d{2}\/\d{4})\s+(.*?)\s+([\+\-]\d+[,\.]\d{2})$/);
            if (match) {
                const [, id, date, description, amount] = match;
                const numAmount = parseFloat(amount.replace(',', '.'));
                
                parsedTransactions.push({
                    id: parseInt(id),
                    date: date,
                    description: description.trim(),
                    amount: numAmount,
                    category: categorizeTransaction(description)
                });
            } else {
                // Cerca pattern alternativi per le transazioni non contabilizzate
                const altMatch = line.match(/(\d{2}\/\d{2}\/\d{4})\s+Non contabilizzato.*?(\-\d+[,\.]\d{2})$/);
                if (altMatch) {
                    const [, date, amount] = altMatch;
                    const numAmount = parseFloat(amount.replace(',', '.'));
                    
                    // Estrai la descrizione dalla linea
                    const descMatch = line.match(/PAGAMENTO CARTA.*?PRESSO\s+(.*?)\s+\\/);
                    const description = descMatch ? descMatch[1] : 'Pagamento carta';
                    
                    parsedTransactions.push({
                        id: parsedTransactions.length + 1,
                        date: date,
                        description: description.trim(),
                        amount: numAmount,
                        category: categorizeTransaction(description)
                    });
                }
            }
        }
        
        return parsedTransactions.sort((a, b) => new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-')));
    }

    // Aggiorna l'analisi con le transazioni fornite
    function updateAnalysis(transactions) {
        updateSummary(transactions);
        createCharts(transactions);
        populateTables(transactions);
    }

    // Funzione per calcolare le statistiche
    function calculateStats(transactions) {
        const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const expenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
        const balance = income - expenses;
        
        return { income, expenses, balance, total: transactions.length };
    }

    // Funzione per raggruppare per categoria
    function groupByCategory(transactions) {
        const categories = {};
        const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
        
        transactions.forEach(t => {
            if (!categories[t.category]) {
                categories[t.category] = { count: 0, amount: 0 };
            }
            categories[t.category].count++;
            categories[t.category].amount += t.amount; // Rimuovo Math.abs() per mantenere il segno originale
        });
        
        // Calcola percentuali basate sul valore assoluto
        Object.keys(categories).forEach(cat => {
            categories[cat].percentage = totalExpenses > 0 ? (Math.abs(categories[cat].amount) / totalExpenses * 100).toFixed(1) : 0;
        });
        
        return categories;
    }

    // Funzione per formattare valuta
    function formatCurrency(amount) {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }

    // Funzione per creare i grafici
    function createCharts(transactions) {
        const expenses = transactions.filter(t => t.amount < 0);
        const categories = groupByCategory(expenses);
        
        // Distruggi grafici esistenti
        Object.values(charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        
        // Grafico a torta delle spese
        const ctx1 = document.getElementById('expensesPieChart').getContext('2d');
        charts.pie = new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories).map(c => c.amount),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + formatCurrency(context.parsed);
                            }
                        }
                    }
                }
            }
        });

        // Grafico entrate vs uscite
        const stats = calculateStats(transactions);
        const ctx2 = document.getElementById('incomeExpensesChart').getContext('2d');
        charts.bar = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['Entrate', 'Uscite'],
                datasets: [{
                    data: [stats.income, stats.expenses],
                    backgroundColor: ['#4CAF50', '#f44336']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });

        // Grafico trend mensile
        const monthlyData = {};
        transactions.forEach(t => {
            const month = t.date.substring(3); // MM/YYYY
            if (!monthlyData[month]) {
                monthlyData[month] = { income: 0, expenses: 0 };
            }
            if (t.amount > 0) {
                monthlyData[month].income += t.amount;
            } else {
                monthlyData[month].expenses += Math.abs(t.amount);
            }
        });

        const months = Object.keys(monthlyData).sort();
        const ctx3 = document.getElementById('monthlyTrendChart').getContext('2d');
        charts.line = new Chart(ctx3, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Entrate',
                    data: months.map(m => monthlyData[m].income),
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    fill: true
                }, {
                    label: 'Uscite',
                    data: months.map(m => monthlyData[m].expenses),
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });

        // Grafico metodi di pagamento
        const paymentMethods = {};
        transactions.forEach(t => {
            let method = 'Altro';
            const desc = t.description.toLowerCase();
            
            if (desc.includes('pos') || desc.includes('carta')) {
                method = 'Carta';
            } else if (desc.includes('prelievo')) {
                method = 'Prelievo';
            } else if (desc.includes('bonifico')) {
                method = 'Bonifico';
            } else if (desc.includes('emolumenti') || desc.includes('cedole')) {
                method = 'Accredito';
            }
            
            if (!paymentMethods[method]) {
                paymentMethods[method] = 0;
            }
            paymentMethods[method] += Math.abs(t.amount);
        });

        const ctx4 = document.getElementById('paymentMethodsChart').getContext('2d');
        charts.payment = new Chart(ctx4, {
            type: 'bar',
            data: {
                labels: Object.keys(paymentMethods),
                datasets: [{
                    data: Object.values(paymentMethods),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }

    // Funzione per aggiornare il riepilogo
    function updateSummary(transactions) {
        const stats = calculateStats(transactions);
        
        document.getElementById('totalIncome').textContent = formatCurrency(stats.income);
        document.getElementById('totalExpenses').textContent = formatCurrency(stats.expenses);
        document.getElementById('netBalance').textContent = formatCurrency(stats.balance);
        document.getElementById('totalTransactions').textContent = stats.total;
        
        // Colora il saldo
        const balanceElement = document.getElementById('netBalance');
        balanceElement.className = 'amount ' + (stats.balance >= 0 ? 'income' : 'expense');
    }

    // Funzione per popolare le tabelle
    function populateTables(transactions) {
        // Tabella categorie
        const categories = groupByCategory(transactions);
        const categoryTableBody = document.querySelector('#categoryTable tbody');
        categoryTableBody.innerHTML = '';
        
        // Ordina categorie per importo
        const sortedCategories = Object.entries(categories).sort((a, b) => b[1].amount - a[1].amount);
        
        sortedCategories.forEach(([category, data]) => {
            const row = categoryTableBody.insertRow();
            row.innerHTML = `
                <td>${category}</td>
                <td>${data.count}</td>
                <td class="${data.amount > 0 ? 'positive' : 'negative'}">${formatCurrency(data.amount)}</td>
                <td>${data.percentage}%</td>
            `;
        });
        
        // Tabella transazioni
        const transactionsTableBody = document.querySelector('#transactionsTable tbody');
        transactionsTableBody.innerHTML = '';
        
        // Mostra le ultime 50 transazioni
        const recentTransactions = transactions.slice(0, 50);
        
        recentTransactions.forEach(transaction => {
            const row = transactionsTableBody.insertRow();
            row.innerHTML = `
                <td>${transaction.date}</td>
                <td>${transaction.description}</td>
                <td>${transaction.category}</td>
                <td class="${transaction.amount >= 0 ? 'positive' : 'negative'}">${formatCurrency(transaction.amount)}</td>
            `;
        });
    }

    // Gestione caricamento file
    document.getElementById('fileInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        document.getElementById('loading').style.display = 'block';
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                const transactions = parseTransactionFile(content);
                
                if (transactions.length === 0) {
                    alert('Nessuna transazione trovata nel file. Verifica il formato del file.');
                    return;
                }
                
                // Salva il file (sostituisce se esiste già)
                saveFile(file.name, content, transactions);
                
                // Aggiorna l'interfaccia
                updateFilesList();
                showAllData();
                
                alert(`File caricato con successo! Trovate ${transactions.length} transazioni.`);
                
            } catch (error) {
                alert('Errore nel processare il file: ' + error.message);
                console.error('Errore parsing:', error);
            } finally {
                document.getElementById('loading').style.display = 'none';
                // Reset input file
                e.target.value = '';
            }
        };
        
        reader.readAsText(file);
    });
