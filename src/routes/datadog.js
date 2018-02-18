import Metrics from "datadog-metrics";

export default app => {
  let dogstatsd;
  if (process.env.DATADOG_API_KEY && process.env.NODE_ENV === "production") {
    dogstatsd = new Metrics.BufferedMetricsLogger({
      apiKey: process.env.DATADOG_API_KEY,
      appKey: process.env.DATADOG_APP_KEY,
      prefix: `heighliner.${process.env.SENTRY_ENVIRONMENT}.`,
      flushIntervalSeconds: 15,
    });

    setInterval(() => {
      const memUsage = process.memoryUsage();
      dogstatsd.gauge("memory.rss", memUsage.rss);
      dogstatsd.gauge("memory.heapTotal", memUsage.heapTotal);
      dogstatsd.gauge("memory.heapUsed", memUsage.heapUsed);
    }, 5000);
  }

  // datadog
  if (dogstatsd) {
    app.use((req, res, next) => {
      if (!req._startTime) req._startTime = new Date();
      const end = res.end;
      res.end = (chunk, encoding) => {
        res.end = end;
        res.end(chunk, encoding);
        const baseUrl = req.baseUrl;
        const statTags = [`route:${baseUrl}${req.path}`];

        statTags.push(`method:${req.method.toLowerCase()}`);
        statTags.push(`protocol:${req.protocol}`);
        statTags.push(`path:${baseUrl}${req.path}`);
        statTags.push(`response_code:${res.statusCode}`);

        dogstatsd.increment(`response_code.${res.statusCode}`, 1, statTags);
        dogstatsd.increment("response_code.all", 1, statTags);

        const now = new Date() - req._startTime;
        dogstatsd.histogram("response_time", now, statTags);
      };

      next();
    });
  }
  return dogstatsd;
};
