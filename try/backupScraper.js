// Importazione delle librerie necessarie
const { Browser , Builder, By } = require('selenium-webdriver');
const Chrome = require('selenium-webdriver/chrome');
const options = new Chrome.Options();

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

        options.addArguments("--disable-search-engine-choice-screen");
        //options.addArguments("--headless=new");
        options.addArguments('--log-level=1')

        // Creazione di una nuova istanza del driver di Chrome
        this.#seleniumChromeDriver = await new Builder().forBrowser(Browser.CHROME)
        .setChromeOptions(options)
        .build();

    }

    // Metodo per aprire la pagina web
    async openPage() {
        try {
            await this.#seleniumChromeDriver.manage().setTimeouts({implicit: 10000});
            await this.#seleniumChromeDriver.get(this.#url);
            //Rimozione banner cookie 
            let rejectCookieElement = await this.#seleniumChromeDriver.findElement(By.name('reject')).click()
            
            let url = await this.#seleniumChromeDriver.getCurrentUrl();
            if(url != this.#url){
                console.log("Gli URL non sono uguali");
            }

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
            console.log(`Prezzo : ${priceValue}`);
            
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

            console.log(values);
            

           
            
        } catch (error) {
            console.error(`Errore durante il web scraping: ${error}`);
        }
    }

    // Metodo per chiudere il driver del browser
    async closeDriver() {
        if (this.#seleniumChromeDriver != null) {
            await this.#seleniumChromeDriver.quit();
        }
    }

    // Metodo principale per eseguire l'intero processo di scraping
    async run() {
        await this.initDriver();  // Inizializza il driver del browser
        await this.openPage();    // Apre la pagina web
        await this.scrapeData();  // Esegue il web scraping
        //await this.closeDriver(); // Chiude il driver del browser
    }


}

(async () => {


    const ticker = "FBK.MI";
    const url = `https://finance.yahoo.com/quote/${ticker}`;
    const scraper = new Scraper(ticker,url);

    try {
        await scraper.run();  // Esegue il processo di scraping

        return;
    } catch (error) {
        console.error(`Errore durante l'esecuzione dello scraper: ${error}`);
    }
})();

