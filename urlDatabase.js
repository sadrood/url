// URL databases
const phishingUrls = [
    'phishing-site.com',
    'fake-bank.net',
    'scam-service.org',
    'malicious-site.io',
    'email-phishing.com',
    'suspicious-login.net',
    'data-theft.ru',
    'credential-steal.cn',
];

const whitelistUrls = [
    'google.com',
    'microsoft.com',
    'github.com',
    'apple.com',
    'amazon.com',
    'linkedin.com',
    'baidu.com',
    'qq.com',
];

// AI scoring system mock
const aiScoreUrl = (url) => {
    return new Promise((resolve) => {
        // Simulate AI processing time
        setTimeout(() => {
            // Calculate a "risk score" between 0-100
            // Higher values = more risky
            
            // Factors that increase risk:
            // - Unusual TLDs (.xyz, .info, etc.)
            // - Numeric characters in domain
            // - Very long domain names
            // - Hyphens/special characters
            // - Misspellings of popular domains
            
            let score = 0;
            
            // Base score - random component with some URLs more likely to be bad
            score += Math.random() * 30;
            
            const domain = extractDomain(url);
            
            // Check for unusual TLDs
            const unusualTlds = ['.xyz', '.info', '.club', '.online', '.site', '.biz', '.top'];
            if (unusualTlds.some(tld => domain.endsWith(tld))) {
                score += 15;
            }
            
            // Check for numeric characters in domain
            if (/\d/.test(domain.split('.')[0])) {
                score += 10;
            }
            
            // Check for very long domain names
            if (domain.length > 20) {
                score += 15;
            }
            
            // Check for hyphens
            if (domain.includes('-')) {
                score += 10;
            }
            
            // Check for common misspellings
            const popularDomains = ['google', 'facebook', 'amazon', 'microsoft', 'apple', 'paypal', 'twitter'];
            for (const popular of popularDomains) {
                if (domain.includes(popular) && !domain.startsWith(popular)) {
                    score += 25;
                    break;
                }
            }
            
            // Cap the score at 100
            score = Math.min(Math.round(score), 100);
            
            resolve(score);
        }, 1500);
    });
};

// Helper functions
function extractDomain(url) {
    // Remove protocol if present
    let domain = url.toLowerCase();
    if (domain.startsWith('http://')) {
        domain = domain.substring(7);
    } else if (domain.startsWith('https://')) {
        domain = domain.substring(8);
    }
    
    // Remove path, query parameters, etc.
    domain = domain.split('/')[0];
    
    // Remove port if present
    domain = domain.split(':')[0];
    
    // Remove www. if present
    if (domain.startsWith('www.')) {
        domain = domain.substring(4);
    }
    
    return domain;
}

function isUrlInList(url, list) {
    const domain = extractDomain(url);
    return list.some(listedDomain => {
        return domain === listedDomain || domain.endsWith('.' + listedDomain);
    });
}

function checkIfPhishing(url) {
    return isUrlInList(url, phishingUrls);
}

function checkIfWhitelisted(url) {
    return isUrlInList(url, whitelistUrls);
}

function addToPhishingList(url) {
    const domain = extractDomain(url);
    if (!phishingUrls.includes(domain)) {
        phishingUrls.push(domain);
        return true;
    }
    return false;
}

function addToWhitelist(url) {
    const domain = extractDomain(url);
    if (!whitelistUrls.includes(domain)) {
        whitelistUrls.push(domain);
        return true;
    }
    return false;
}

function removeFromPhishingList(url) {
    const index = phishingUrls.indexOf(url);
    if (index !== -1) {
        phishingUrls.splice(index, 1);
        return true;
    }
    return false;
}

function removeFromWhitelist(url) {
    const index = whitelistUrls.indexOf(url);
    if (index !== -1) {
        whitelistUrls.splice(index, 1);
        return true;
    }
    return false;
}
