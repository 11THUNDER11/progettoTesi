// Importazione delle librerie necessarie
const { Browser , Builder, By , until} = require('selenium-webdriver');
const Chrome = require('selenium-webdriver/chrome');
const { parentPort, workerData } = require('worker_threads');

class Scraper {
    #url;
    #ticker;
    #seleniumChromeDriver;

    constructor(ticker,url){
        this.#ticker = ticker;
        this.#url = url;
        this.#seleniumChromeDriver = null;
    }

    // Metodo per inizializzare il driver del browser
    async initDriver() {
        const options = new Chrome.Options();

        options.addArguments("--disable-search-engine-choice-screen");
        options.addArguments("--headless=new");
        options.addArguments('--log-level=1')

        // Creazione di una nuova istanza del driver di Chrome
        this.#seleniumChromeDriver = await new Builder()
        .forBrowser(Browser.CHROME)
        .setChromeOptions(options)
        .build();

    }

    // Metodo per aprire la pagina web
    async openPage() {
        try {
            await this.#seleniumChromeDriver.get(this.#url);
            await this.#seleniumChromeDriver.manage().setTimeouts({implicit: 2000});
            //Rimozione banner cookie 
            let rejectCookieElement = await this.#seleniumChromeDriver.findElement(By.name('reject')).click()

            let title = await this.#seleniumChromeDriver.getTitle();
            console.log("Titolo pagina : ", title);
            
        } catch (error) {
            console.error(`Errore durante l'apertura della pagina: ${error}`);
        }
    }

    // Metodo per eseguire il web scraping
    async scrapeData() {
        try {
            
            let priceElement = await this.#seleniumChromeDriver.findElement(By.className('livePrice')); 
            
            let priceValue = await priceElement.getText();  // Ottiene il testo dell'elemento
            //console.log(`Prezzo : ${priceValue}`);
            
            let stockIndicatorsElement = await this.#seleniumChromeDriver.findElement(By.className('yf-tx3nkj')); 
            let rawValues = await stockIndicatorsElement.getText();
            

            let lines = rawValues.split('\n');
            let values = new Map();

            values.set("ticker",this.#ticker);
            values.set("price",priceValue);
            
            for(let i = 0; i < lines.length; i+=2){
                //console.log(`Indicatore : ${lines[i]} , Valore : ${lines[i+1]}`);
                values.set(lines[i],lines[i+1]);
            }

            //console.log("Scraper data : ",values);
            let json = JSON.stringify(Object.fromEntries(values));
            return json;

           
            
        } catch (error) {
            console.error(`Errore ${this.#ticker} durante il web scraping: ${error}`);
        }
    }

    // Metodo per chiudere il driver del browser
    async closeDriver() {
        if (this.#seleniumChromeDriver) {
            await this.#seleniumChromeDriver.quit();
            console.log("Driver chiuso con successo");
        }
    }

    // Metodo principale per eseguire l'intero processo di scraping
    async run() {

        try{
            await this.initDriver();  // Inizializza il driver del browser
            await this.openPage();    // Apre la pagina web
            const data = await this.scrapeData();  // Esegue il web scraping
            return data;
        }
        catch (error) {
            console.error(`Errore nel processo di scraping per il ticker ${this.#ticker}: ${error}`);
        } finally {
            await this.closeDriver(); // Chiude il driver del browser
        }

    }

    getInfo = function() {
        console.log(`Ticker : ${this.#ticker}`);
    };
}



async function runScraper(){
    const { url, ticker } = workerData;

    try{
        let scraper = new Scraper(workerData.ticker,workerData.url);
        const data = await scraper.run();
        parentPort.postMessage({ success: true, data });

    }
    catch (error) {
        parentPort.postMessage({ success: false, error: error.message });
    }
}

runScraper();