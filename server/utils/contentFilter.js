// Content moderation utility for filtering inappropriate content

const ADULT_CONTENT_PATTERNS = [
    // Explicit adult content keywords
    /\b(porn|xxx|sex|nude|naked|nsfw|adult|horny|sexy|erotic|sexual|intercourse|fuck|shit|ass|bitch|cunt|dick|pussy|cock|boobs|tits|breasts|vagina|penis)\b/gi,
    
    // Suggestive content
    /\b(hookup|one.night.stand|casual.sex|friends.with.benefits|sugar.daddy|sugar.baby|escort|prostitute)\b/gi,
    
    // Drug-related content
    /\b(weed|marijuana|cocaine|heroin|meth|drugs|stoned|high|addiction|overdose)\b/gi,
];

const THREATENING_CONTENT_PATTERNS = [
    // Direct threats
    /\b(kill|murder|death|die|suicide|homicide|assassinate|slaughter|massacre|terror|attack|harm|hurt|injure|violence|violent)\b/gi,
    
    // Threats of violence
    /\b(shoot|stab|bomb|explode|weapon|gun|knife|rifle|pistol|threat|intimidate|bully|harass)\b/gi,
    
    // Hate speech
    /\b(hate|racist|nazi|terrorist|extremist|supremacist|discrimination|bigot)\b/gi,
    
    // Self-harm indicators
    /\b(self.harm|cutting|suicidal|depressed|depression|anxiety|panic.attack|mental.breakdown)\b/gi,
];

const SPAM_PATTERNS = [
    // Excessive capitalization
    /^[A-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{10,}$/i,
    
    // Repetitive characters
    /(.)\1{4,}/,
    
    // Multiple links
    /(http[s]?:\/\/[^\s]+)/gi,
];

/**
 * Check if content contains inappropriate material
 * @param {string} content - The content to check
 * @returns {object} - Object containing violation flags and reasons
 */
function checkContentViolations(content) {
    if (!content || typeof content !== 'string') {
        return { hasViolation: false, reasons: [] };
    }

    const violations = {
        hasAdultContent: false,
        hasThreateningContent: false,
        hasSpam: false,
        reasons: []
    };

    const lowerContent = content.toLowerCase();

    // Check for adult content
    ADULT_CONTENT_PATTERNS.forEach(pattern => {
        if (pattern.test(content)) {
            violations.hasAdultContent = true;
            violations.reasons.push('Contains adult or inappropriate content');
        }
    });

    // Check for threatening content
    THREATENING_CONTENT_PATTERNS.forEach(pattern => {
        if (pattern.test(content)) {
            violations.hasThreateningContent = true;
            violations.reasons.push('Contains threatening or harmful content');
        }
    });

    // Check for spam
    SPAM_PATTERNS.forEach(pattern => {
        if (pattern.test(content)) {
            violations.hasSpam = true;
            violations.reasons.push('Appears to be spam or low-quality content');
        }
    });

    // Additional checks
    if (content.length > 2000) {
        violations.hasSpam = true;
        violations.reasons.push('Content exceeds maximum length limit');
    }

    // Check for excessive profanity (simple count)
    const profanityCount = (content.match(/\b(fuck|shit|damn|hell|bitch|ass|cunt|dick|pussy|cock)\b/gi) || []).length;
    if (profanityCount > 5) {
        violations.hasAdultContent = true;
        violations.reasons.push('Contains excessive profanity');
    }

    return {
        hasViolation: violations.hasAdultContent || violations.hasThreateningContent || violations.hasSpam,
        ...violations
    };
}

/**
 * Filter content and return appropriate response
 * @param {string} content - The content to filter
 * @returns {object} - Filter result with action needed
 */
function filterContent(content) {
    const violations = checkContentViolations(content);
    
    if (violations.hasViolation) {
        let action = 'warning';
        let message = 'Your post contains inappropriate content and cannot be published.';
        
        if (violations.hasThreateningContent) {
            action = 'block';
            message = 'Your post contains threatening or harmful content and has been blocked. This may result in account suspension.';
        } else if (violations.hasAdultContent) {
            action = 'block';
            message = 'Your post contains adult or inappropriate content and cannot be published.';
        } else if (violations.hasSpam) {
            action = 'block';
            message = 'Your post appears to be spam or low-quality content and cannot be published.';
        }
        
        return {
            allowed: false,
            action,
            message,
            reasons: violations.reasons,
            violations
        };
    }
    
    return {
        allowed: true,
        action: 'allow',
        message: 'Content is acceptable'
    };
}

export {
    checkContentViolations,
    filterContent,
    ADULT_CONTENT_PATTERNS,
    THREATENING_CONTENT_PATTERNS,
    SPAM_PATTERNS
};
