#!/usr/bin/env node

/**
 * Performance Testing Script for Store Management System
 * Run with: node performance-test.js
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const CONFIG = {
    baseUrl: 'http://localhost:5000',
    apiEndpoints: [
        '/api/health',
        '/api/requests',
        '/api/requests/stats',
        '/api/items',
        '/api/employees'
    ],
    concurrentUsers: 10,
    requestsPerUser: 50,
    testDuration: 30000 // 30 seconds
};

class PerformanceTester {
    constructor() {
        this.results = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            responseTimes: [],
            errors: [],
            startTime: null,
            endTime: null
        };
    }

    async makeRequest(endpoint) {
        return new Promise((resolve) => {
            const url = new URL(endpoint, CONFIG.baseUrl);
            const client = url.protocol === 'https:' ? https : http;

            const startTime = Date.now();

            const req = client.request(url, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    const responseTime = Date.now() - startTime;
                    const success = res.statusCode >= 200 && res.statusCode < 300;

                    resolve({
                        success,
                        statusCode: res.statusCode,
                        responseTime,
                        endpoint,
                        dataSize: data.length
                    });
                });
            });

            req.on('error', (error) => {
                const responseTime = Date.now() - startTime;
                resolve({
                    success: false,
                    statusCode: 0,
                    responseTime,
                    endpoint,
                    error: error.message
                });
            });

            req.setTimeout(10000, () => {
                req.destroy();
                const responseTime = Date.now() - startTime;
                resolve({
                    success: false,
                    statusCode: 0,
                    responseTime,
                    endpoint,
                    error: 'Request timeout'
                });
            });

            req.end();
        });
    }

    async runLoadTest() {
        console.log('🚀 Starting Performance Test');
        console.log(`📊 Testing ${CONFIG.concurrentUsers} concurrent users`);
        console.log(`📈 Each user making ${CONFIG.requestsPerUser} requests`);
        console.log(`⏱️  Test duration: ${CONFIG.testDuration / 1000} seconds\n`);

        this.results.startTime = Date.now();

        const userPromises = [];

        for (let i = 0; i < CONFIG.concurrentUsers; i++) {
            userPromises.push(this.simulateUser(i));
        }

        await Promise.all(userPromises);

        this.results.endTime = Date.now();
        this.generateReport();
    }

    async simulateUser(userId) {
        for (let i = 0; i < CONFIG.requestsPerUser; i++) {
            const endpoint = CONFIG.apiEndpoints[Math.floor(Math.random() * CONFIG.apiEndpoints.length)];
            const result = await this.makeRequest(endpoint);

            this.updateResults(result);

            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        }
    }

    updateResults(result) {
        this.results.totalRequests++;
        this.results.responseTimes.push(result.responseTime);

        if (result.success) {
            this.results.successfulRequests++;
        } else {
            this.results.failedRequests++;
            if (result.error) {
                this.results.errors.push({
                    endpoint: result.endpoint,
                    error: result.error,
                    statusCode: result.statusCode
                });
            }
        }
    }

    generateReport() {
        const duration = this.results.endTime - this.results.startTime;
        const avgResponseTime = this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length;
        const p95ResponseTime = this.percentile(this.results.responseTimes, 95);
        const p99ResponseTime = this.percentile(this.results.responseTimes, 99);
        const rps = (this.results.totalRequests / duration) * 1000;

        console.log('\n📊 Performance Test Results');
        console.log('='.repeat(50));
        console.log(`Total Requests: ${this.results.totalRequests}`);
        console.log(`Successful: ${this.results.successfulRequests} (${((this.results.successfulRequests / this.results.totalRequests) * 100).toFixed(2)}%)`);
        console.log(`Failed: ${this.results.failedRequests} (${((this.results.failedRequests / this.results.totalRequests) * 100).toFixed(2)}%)`);
        console.log(`Test Duration: ${duration}ms`);
        console.log(`Requests/sec: ${rps.toFixed(2)}`);
        console.log('\n⏱️  Response Times:');
        console.log(`Average: ${avgResponseTime.toFixed(2)}ms`);
        console.log(`P95: ${p95ResponseTime.toFixed(2)}ms`);
        console.log(`P99: ${p99ResponseTime.toFixed(2)}ms`);
        console.log(`Min: ${Math.min(...this.results.responseTimes)}ms`);
        console.log(`Max: ${Math.max(...this.results.responseTimes)}ms`);

        if (this.results.errors.length > 0) {
            console.log('\n❌ Errors:');
            const errorCounts = {};
            this.results.errors.forEach(error => {
                const key = `${error.statusCode || 'TIMEOUT'}: ${error.error}`;
                errorCounts[key] = (errorCounts[key] || 0) + 1;
            });

            Object.entries(errorCounts).forEach(([error, count]) => {
                console.log(`  ${error}: ${count} times`);
            });
        }

        // Performance recommendations
        this.generateRecommendations(avgResponseTime, rps, this.results.failedRequests);

        // Save results to file
        this.saveResults();
    }

    percentile(arr, p) {
        const sorted = [...arr].sort((a, b) => a - b);
        const index = Math.ceil((p / 100) * sorted.length) - 1;
        return sorted[index] || 0;
    }

    generateRecommendations(avgResponseTime, rps, failedRequests) {
        console.log('\n💡 Performance Recommendations:');
        console.log('-'.repeat(50));

        if (avgResponseTime > 1000) {
            console.log('⚠️  High average response time (>1000ms)');
            console.log('   → Consider database query optimization');
            console.log('   → Add caching for frequently accessed data');
            console.log('   → Review API endpoint efficiency');
        }

        if (rps < 10) {
            console.log('⚠️  Low requests per second (<10 RPS)');
            console.log('   → Check server resources (CPU, memory)');
            console.log('   → Consider horizontal scaling');
            console.log('   → Optimize database connections');
        }

        if (failedRequests > this.results.totalRequests * 0.05) {
            console.log('⚠️  High failure rate (>5%)');
            console.log('   → Check server error logs');
            console.log('   → Review error handling');
            console.log('   → Monitor database connectivity');
        }

        if (avgResponseTime < 200 && rps > 50 && failedRequests === 0) {
            console.log('✅ Excellent performance!');
            console.log('   → Consider stress testing with higher load');
        }
    }

    saveResults() {
        const results = {
            timestamp: new Date().toISOString(),
            config: CONFIG,
            results: this.results
        };

        const filename = `performance-results-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(results, null, 2));
        console.log(`\n💾 Results saved to ${filename}`);
    }
}

// Run the test
if (require.main === module) {
    const tester = new PerformanceTester();
    tester.runLoadTest().catch(console.error);
}

module.exports = PerformanceTester;