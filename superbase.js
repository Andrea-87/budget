const SUPABASE_URL = 'https://vuleuwrwcprvvreotnmt.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1bGV1d3J3Y3BydnZyZW90bm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTkyOTEsImV4cCI6MjA2NDI3NTI5MX0.-YrLiQHS_39mN_WXett2Ao_0hSghQ5szlZ9H648PW0U';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1bGV1d3J3Y3BydnZyZW90bm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTkyOTEsImV4cCI6MjA2NDI3NTI5MX0.-YrLiQHS_39mN_WXett2Ao_0hSghQ5szlZ9H648PW0U';

// Funzioni di esempio per mostrare gli stati di loading
function showLoading(buttonId, loadingText) {
	const btn = document.getElementById(buttonId);
	const originalHTML = btn.innerHTML;
	btn.disabled = true;
	btn.innerHTML = `<div class="loading-spinner"></div><span>${loadingText}</span>`;
	return originalHTML;
}

function hideLoading(buttonId, originalHTML) {
	const btn = document.getElementById(buttonId);
	btn.disabled = false;
	btn.innerHTML = originalHTML;
}

function showStatus(message, type) {
	const statusEl = document.getElementById('statusMessage');
	statusEl.textContent = message;
	statusEl.className = `status-message ${type}`;
	statusEl.style.display = 'block';

	setTimeout(() => {
		statusEl.style.display = 'none';
	}, 5000);
}

// Esempio di funzione loadJson modificata
async function loadJson() {
	const recordId = document.getElementById('recordId').value;
	if (!recordId) {
		showStatus('Il campo Chiave ID è obbligatorio', 'error');
		return;
	}

	const originalHTML = showLoading('loadBtn', 'Caricamento...');

	try {
		// Chiamata API
		const url = `${SUPABASE_URL}/rest/v1/data_store?id=eq.${recordId}`;

		const res = await fetch(url, {
			headers: {
				'apikey': ANON_KEY,
				'Authorization': `Bearer ${ANON_KEY}`
			}
		});

		const result = await res.json();
		const data = result[0]?.data;

		let value = data ? JSON.stringify(data, null, 2) : "";

		localStorage.removeItem('bankFiles');
		localStorage.setItem('bankFiles', value);

		loadStoredFiles();
		updateFilesList();
		if (storedFiles.size > 0) {
			showAllData();
		}

		showStatus('Dati caricati con successo!', 'success');
	} catch (error) {
		showStatus('Errore nel caricamento dei dati', 'error');
	} finally {
		hideLoading('loadBtn', originalHTML);
	}
}

// Esempio di funzione saveJson modificata
async function saveJson() {
	const recordId = document.getElementById('recordId').value;
	if (!recordId) {
		showStatus('Il campo Chiave ID è obbligatorio', 'error');
		return;
	}

	const originalHTML = showLoading('saveBtn', 'Salvataggio...');

	try {
		// Chiamata API
		const rawInput = localStorage.getItem('bankFiles');
		let parsedJson = JSON.parse(rawInput);

		const url = `${SUPABASE_URL}/rest/v1/data_store`;

		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'apikey': SERVICE_ROLE_KEY,
				'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
				'Content-Type': 'application/json',
				'Prefer': 'resolution=merge-duplicates'
			},
			body: JSON.stringify({
				id: recordId,
				data: parsedJson
			})
		});

		const result = await res;

		if (res.ok) {
			showStatus('Dati salvati con successo!', 'success');
		} else {
			showStatus('Errore nel salvataggio dei dati', 'error');
		}
	} catch (error) {
		showStatus('Errore nel salvataggio dei dati', 'error');
	} finally {
		hideLoading('saveBtn', originalHTML);
	}
}
