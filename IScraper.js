class IScraper {
    
    initDriver() {
        throw new Error("IScraper Method 'initDriver' must be implemented.");
    }

    openPage() {
        throw new Error("IScraper Method 'openPage' must be implemented.");
    }

    scrapeData() {
        throw new Error("IScraper Method 'scrapeData' must be implemented.");
    }

    closeDriver() {
        throw new Error("IScraper Method 'closeDriver' must be implemented.");
    }


    


}

module.exports = {IScraper};