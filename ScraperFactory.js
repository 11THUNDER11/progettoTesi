
const { YahooSeleniumScraper } = require("./YahooSeleniumScraper")
class ScraperFactory {
    
    getFactory(whichFactory){
        switch(whichFactory){
            default : return new SeleniumScraperFactory();
        }
    }

    getYahooScraper() {
        throw new Error("Method 'getYahooScraper' must be implemented.");
    }


}

class SeleniumScraperFactory extends ScraperFactory {
    constructor() {
        super();
    }

    getYahooScraper(url) {
        return new YahooSeleniumScraper(url);
    }
}

module.exports = {ScraperFactory, SeleniumScraperFactory,YahooSeleniumScraper}