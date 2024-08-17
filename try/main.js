const { Worker } = require('worker_threads');

function runScraper(url, ticker) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./scraperWorker.js', {
        workerData: { url, ticker }
        });

        worker.on('message', (result) => {
        if (result.success) {
            resolve(result.data);
        } else {
            reject(new Error(result.error));
        }
        });

        worker.on('error', reject);
        worker.on('exit', (code) => {
        if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
        }
        });
    });
}

(async () => {
    const baseUrl = "https://finance.yahoo.com/quote/";

    //Tickers dei vari titoli
    const tickers = [
      "1INTC.MI",
      "FBK.MI",
      "RACE.MI",
      "TSLA",
      "BABA",
      "PYPL"
    ];
  
    try {
      const promises = tickers.map(ticker => runScraper(baseUrl + ticker, ticker));
      const results = await Promise.all(promises);
  
      console.log('Tutti i dati di scraping raccolti:');
      results.forEach(result => {
        let res = JSON.parse(result);
        console.log("---------------------------");
        console.log("Ticker : ",res['ticker']);
        console.log("Price : ",res['price']);
        console.log("PE : ",res['PE Ratio (TTM)'])
      })
  
    } catch (error) {
      console.error('Errore durante l\'esecuzione delle operazioni di scraping:', error);
    }
})();