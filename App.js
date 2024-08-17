/*
    let factory = new ScraperFactory();
let seleniumFactory = factory.getFactory(0);

let scraper = seleniumFactory.getYahooScraper("https://finance.yahoo.com/quote/INTC");

console.log(scraper.getInfo());
*/

const { promise } = require("selenium-webdriver");
const { ScraperController } = require("./scraperController");

const fs = require("fs");

class Application {
    #scraperController;
    #tickers;
    #baseUrl;
    constructor(url,tickers){
        this.#tickers = tickers;
        this.#baseUrl = url;
        
        
    }

    async init(){
        this.#scraperController = await new ScraperController(this.#baseUrl,this.#tickers);
        await this.#scraperController.init();
    }

    async startScrapers(){
        if (!this.#scraperController) {
            throw new Error("ScraperController non è stato inizializzato. Chiamare init() prima di startScrapers().");
        }
        let results = await this.#scraperController.runScrapers();
        
        let jsonResults = results.map(element => {
            let res = Object.fromEntries(element);
            console.log(res);
            return res;
        });
        
        let dir = "./results/";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        // Salva l'intero array di risultati in un unico file JSON
        let path = dir + "results.json";
        try {
            // Converte l'intero array di oggetti in una stringa JSON
            let json = JSON.stringify(jsonResults, null, 2); // Formattato con indentazione
            fs.writeFileSync(path, json, 'utf8');
        } catch (err) {
            console.error("Errore durante il salvataggio dei dati:", err);
        }
        
        
    }

    start(){
        setInterval(async () => {
            await this.startScrapers();
        }, 60000); // Esegui ogni 60 secondi 

        
    }
}

const baseUrl = "https://finance.yahoo.com/quote/"
const tickers = [
    "1INTC.MI",
    "FBK.MI",
    "RACE.MI",
    "UCG.MI",
    "TIT.MI",
    "ENEL.MI",
    "UNI.MI"
    
];

/* 
"INTC"
"1INTC.MI",
"FBK.MI",
"RACE.MI"
*/
const timeWait = 60000;
(async ()=>{
    const myApp = new Application(baseUrl,tickers);
    await myApp.init();
    await myApp.startScrapers();
    //myApp.start();
    
    
    
})();

