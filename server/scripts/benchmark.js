import autocannon from 'autocannon';

const runBenchmark = async () => {
    const url = 'http://localhost:5001/';
    const duration = 10; // seconds

    console.log(`Starting benchmark for ${url} for ${duration} seconds...`);

    const instance = autocannon({
        url,
        connections: 500, // 500 concurrent requests as requested
        duration,
        pipelining: 1, // default
        workers: 1, // default
    }, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            console.log('--- Benchmark Results ---');
            console.log(`URL: ${result.url}`);
            console.log(`Duration: ${result.duration}s`);
            console.log(`Connections: ${result.connections}`);
            console.log(`\nStat         Avg     Min     Max     StdDev`);
            console.log(`Latency (ms) ${result.latency.average}   ${result.latency.min}   ${result.latency.max}   ${result.latency.stddev}`);
            console.log(`Req/Sec      ${result.requests.average}   ${result.requests.min}   ${result.requests.max}   ${result.requests.stddev}`);
            console.log(`Bytes/Sec    ${result.throughput.average}   ${result.throughput.min}   ${result.throughput.max}   ${result.throughput.stddev}`);
            console.log(`\nTotal Requests: ${result.requests.total}`);
            console.log(`Total Errors: ${result.errors}`);
            console.log(`Timeouts: ${result.timeouts}`);
            console.log('-------------------------');
        }
    });

    autocannon.track(instance, { renderProgressBar: true });
};

runBenchmark();
