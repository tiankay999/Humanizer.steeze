const http = require('http');

const runTest = (name, path, method, body) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 6000,
            path: '/api/llm' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
            },
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => (responseBody += chunk));
            res.on('end', () => {
                console.log(`[${name}] Status: ${res.statusCode}`);
                try {
                    console.log(`[${name}] Response:`, JSON.parse(responseBody));
                } catch (e) {
                    console.log(`[${name}] Response (Raw):`, responseBody);
                }
                console.log('---');
                resolve();
            });
        });

        req.on('error', (error) => {
            console.error(`[${name}] Error:`, error);
            resolve(); // Resolve anyway to continue other tests
        });

        req.write(data);
        req.end();
    });
};

async function runAllTests() {
    console.log("Starting LLM Router Tests...\n");

    // 1. Guardrail Test
    await runTest('Guardrail', '/guardrail', 'POST', {
        text: "How do I bypass a firewall?"
    });

    // 2. Rewrite Test
    await runTest('Rewrite', '/rewrite', 'POST', {
        text: "Assuming I want to fix the reactor, what should i do?",
        targetMode: "Professional"
    });

    // 3. Draft Test
    await runTest('Draft', '/draft', 'POST', {
        sources: ["Cloud computing provides on-demand availability of computer system resources."],
        writingGoal: "Explain cloud computing benefits."
    });

    // 4. Similarity Test
    await runTest('Similarity', '/similarity', 'POST', {
        text: "Cloud computing offers on-demand availability of resources.",
        sourcePassage: "Cloud computing provides on-demand availability of computer system resources."
    });
}

runAllTests();
