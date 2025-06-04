// Funzione per codificare il testo
function codifica(testo, chiave) {
    if (!testo || !chiave) {
        throw new Error('Testo e chiave sono obbligatori');
    }
    
    let risultato = '';
    const testoStr = testo.toString();
    const chiaveStr = chiave.toString();
    
    for (let i = 0; i < testoStr.length; i++) {
        // Ottiene il carattere corrente del testo e della chiave
        const charTesto = testoStr.charCodeAt(i);
        const charChiave = chiaveStr.charCodeAt(i % chiaveStr.length);
        
        // Applica XOR tra i due caratteri
        const charCodificato = charTesto ^ charChiave;
        
        // Converte in stringa esadecimale per una rappresentazione sicura
        risultato += charCodificato.toString(16).padStart(2, '0');
    }
    
    return risultato;
}

// Funzione per decodificare il testo
function decodifica(testoCodificato, chiave) {
    if (!testoCodificato || !chiave) {
        throw new Error('Testo codificato e chiave sono obbligatori');
    }
    
    let risultato = '';
    const chiaveStr = chiave.toString();
    
    // Converte la stringa esadecimale in array di numeri
    const bytes = [];
    for (let i = 0; i < testoCodificato.length; i += 2) {
        bytes.push(parseInt(testoCodificato.substr(i, 2), 16));
    }
    
    // Decodifica ogni byte
    for (let i = 0; i < bytes.length; i++) {
        const charChiave = chiaveStr.charCodeAt(i % chiaveStr.length);
        const charDecodificato = bytes[i] ^ charChiave;
        risultato += String.fromCharCode(charDecodificato);
    }
    
    return risultato;
}
