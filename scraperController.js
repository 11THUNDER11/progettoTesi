const { ScraperFactory, SeleniumScraperFactory} = require("./ScraperFactory");
const scraperState = require("./State");
class ScraperController {
    #scrapers
    #factory;
    #tickers;
    #baseUrl;

    constructor(url,tickers){
        this.#factory = new ScraperFactory().getFactory(0);
        this.#tickers = tickers;
        this.#baseUrl = url;

        this.#scrapers = [];
        
        this.#tickers.map(ticker => {
            let scraper = this.#factory.getYahooScraper(this.#baseUrl+ticker);
            this.#scrapers.push(scraper);
        });

    }

    async init(){

        try {
            let initedScrapers = await this.initScrapers();
            let readyScrapers = await this.openScrapersPage(initedScrapers);
            //Controllo che tutti gli scrapers siano attivi
            if(readyScrapers.length === this.#scrapers.length){
                console.log("Tutti gli scrapers pronti");
            }else{
                console.log(`Scrapers iniziali : ${this.#scrapers.length}, inizializzati : ${initedScrapers.length}, pronti : ${readyScrapers.length}`);
                console.log("Scraper rimossi : ");
                this.#scrapers.forEach(scraper =>{
                    if(! readyScrapers.includes(scraper)){
                        console.log(scraper.getInfo());
                    }
                });
            }
        }
        catch(error){
            console.error("Errore durante l'inizializzazione degli scrapers:", error);
        }

        
    }

    

    async runScrapers(){

        try{
            let promises = this.#scrapers.map(scraper => {
                
                return new Promise(async (resolve,reject) => {
                    try{
                        let data = await scraper.scrapeData(); 
                        resolve(data);
                    }
                    catch(error){
                        reject(error);
                    }
                })
                
            });

            const results = await Promise.all(promises);
            return results;

            
        }
        catch(err){
            console.error('Errore durante l\'esecuzione delle operazioni di scraping:', err);
        }
        
    }

    async initScrapers(){
        let scrapersInit = [];
        let promises = this.#scrapers.map(async scraper => {
            await scraper.initDriver();
            console.log(`Scraper ${scraper.getInfo()}, state ${scraper.getState()}`);
            if(scraper.getState() == scraperState.BUILD){
                scrapersInit.push(scraper);
            }
        });
        
        await Promise.all(promises);

        return scrapersInit;
    }

    async openScrapersPage(scrapersInit){
        let scrapersReady = []; 
        let promises = scrapersInit.map(async scraper => {
            await scraper.openPage();
            if(scraper.getState() == scraperState.READY){
                scrapersReady.push(scraper);
            }
        });
        await Promise.all(promises);
        return scrapersReady;
    }
    

    
}

module.exports = {ScraperController}