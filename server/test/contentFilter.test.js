// Test file for content filtering system
import { filterContent, checkContentViolations } from '../utils/contentFilter.js';

// Test cases for content filtering
const testCases = [
    {
        description: 'Clean content',
        content: 'Hello world! I love programming and sharing my thoughts with friends.',
        expected: { allowed: true }
    },
    {
        description: 'Adult content',
        content: 'This is some porn content that should be blocked',
        expected: { allowed: false }
    },
    {
        description: 'Threatening content',
        content: 'I want to kill someone and cause harm to others',
        expected: { allowed: false }
    },
    {
        description: 'Spam content',
        content: 'CHECK OUT THIS AMAZING DEAL!!!!!!! http://spam.com http://more-spam.com',
        expected: { allowed: false }
    },
    {
        description: 'Excessive profanity',
        content: 'Fuck shit damn hell bitch ass cunt dick pussy cock fuck shit damn hell',
        expected: { allowed: false }
    },
    {
        description: 'Drug-related content',
        content: 'I love smoking weed and doing drugs all day long',
        expected: { allowed: false }
    },
    {
        description: 'Hate speech',
        content: 'I hate racist people and nazi supporters',
        expected: { allowed: false }
    },
    {
        description: 'Self-harm content',
        content: 'I am feeling suicidal and want to self harm',
        expected: { allowed: false }
    },
    {
        description: 'Edge case - mild content',
        content: 'This is damn good coffee!',
        expected: { allowed: true }
    },
    {
        description: 'Empty content',
        content: '',
        expected: { allowed: true }
    }
];

// Run tests
function runTests() {
    console.log('Running Content Filter Tests...\n');
    
    let passedTests = 0;
    let totalTests = testCases.length;
    
    testCases.forEach((testCase, index) => {
        const result = filterContent(testCase.content);
        const passed = result.allowed === testCase.expected.allowed;
        
        console.log(`Test ${index + 1}: ${testCase.description}`);
        console.log(`Content: "${testCase.content}"`);
        console.log(`Expected: ${testCase.expected.allowed ? 'Allowed' : 'Blocked'}`);
        console.log(`Actual: ${result.allowed ? 'Allowed' : 'Blocked'}`);
        console.log(`Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
        
        if (!passed) {
            console.log(`Reasons: ${result.reasons ? result.reasons.join(', ') : 'None'}`);
        }
        
        console.log('---');
        
        if (passed) {
            passedTests++;
        }
    });
    
    console.log(`\nTest Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Content filtering is working correctly.');
    } else {
        console.log('⚠️ Some tests failed. Please review the content filtering logic.');
    }
}

// Run tests
runTests();

export { runTests, testCases };
