# Vercel Deployment Guide

This guide explains how to deploy the waitlist API to Vercel with optimized MongoDB connection handling.

## Pre-deployment Optimizations

The following optimizations have been implemented to fix the MongoDB connection issues on Vercel:

### 1. Database Connection Optimization

- **Connection Pooling**: Configured with `maxPoolSize: 10` for optimal connection reuse
- **Timeouts**: Set appropriate timeouts to prevent buffering issues
- **Caching**: Implemented connection caching to reuse connections across serverless function calls
- **Buffering**: Disabled Mongoose buffering with `bufferCommands: false`

### 2. Key Configuration Settings

```javascript
// Optimized MongoDB connection settings
{
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  bufferCommands: false,
  maxIdleTimeMS: 30000,
  heartbeatFrequencyMS: 10000,
  connectTimeoutMS: 30000,
  family: 4
}
```

### 3. Error Handling

- Added comprehensive error handling for connection timeouts
- Graceful degradation when database is unavailable
- Proper HTTP status codes for different error scenarios

## Deployment Steps

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Environment Variables

Set up your environment variables in Vercel:

```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add API_KEY
```

Or set them in the Vercel dashboard:

1. Go to your project in Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

| Variable      | Value                                                                                      | Environment |
| ------------- | ------------------------------------------------------------------------------------------ | ----------- |
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority` | Production  |
| `JWT_SECRET`  | Your JWT secret key                                                                        | Production  |
| `API_KEY`     | Your API key                                                                               | Production  |
| `NODE_ENV`    | `production`                                                                               | Production  |

### Step 3: Deploy

```bash
# Deploy to Vercel
vercel

# Or deploy to production
vercel --prod
```

### Step 4: Monitor Deployment

Check the deployment logs in Vercel dashboard for any issues.

## MongoDB Atlas Configuration

For optimal performance with Vercel, configure your MongoDB Atlas cluster:

### 1. Network Access

- Add `0.0.0.0/0` to IP whitelist (Vercel functions have dynamic IPs)
- Or use Vercel's specific IP ranges if available

### 2. Connection String Optimization

Use these parameters in your connection string:

```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority&maxPoolSize=10&serverSelectionTimeoutMS=5000&socketTimeoutMS=45000&maxIdleTimeMS=30000
```

### 3. Database Performance

- Use appropriate database tier (M10+ recommended for production)
- Enable connection pooling in Atlas
- Consider setting up read replicas for better performance

## Troubleshooting

### Common Issues and Solutions

#### 1. "Operation buffering timed out" Error

**Solution**: The new connection configuration disables buffering and uses connection caching.

#### 2. "Connection timeout" Error

**Solution**: Increased timeout values and implemented retry logic.

#### 3. "Too many connections" Error

**Solution**: Connection pooling limits connections to 10 per function instance.

#### 4. Cold Start Issues

**Solution**: Connection caching reuses existing connections across function calls.

### Monitoring

Check these metrics in Vercel and MongoDB Atlas:

1. **Vercel Function Logs**: Monitor for connection errors
2. **MongoDB Atlas Metrics**: Watch connection count and response times
3. **Performance**: Monitor function execution time
4. **Error Rates**: Track 5xx error responses

### Testing the Deployment

Use these commands to test your deployed API:

```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Test with valid API key
curl -X GET https://your-app.vercel.app/api/projects \
  -H "Authorization: Bearer YOUR_API_KEY"

# Test adding to waitlist
curl -X POST https://your-app.vercel.app/api/waitlist/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PROJECT_API_TOKEN" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "extra": "Testing deployment"
  }'
```

## Performance Optimization

### 1. Function Configuration

- **Max Duration**: Set to 30 seconds for database operations
- **Memory**: Default 1024MB should be sufficient
- **Regions**: Deploy to regions close to your MongoDB cluster

### 2. Database Optimization

- **Indexing**: Ensure proper indexes on frequently queried fields
- **Connection Pooling**: Use the optimized pool settings
- **Query Optimization**: Use efficient queries and projections

### 3. Monitoring

Monitor these metrics:

- Function execution time
- Database connection time
- Error rates
- Memory usage

## Security Considerations

### 1. Environment Variables

- Never commit sensitive data to git
- Use Vercel's environment variable system
- Rotate API keys regularly

### 2. Database Security

- Use strong passwords
- Enable IP whitelisting where possible
- Monitor connection logs
- Use SSL/TLS connections

### 3. API Security

- Validate all inputs
- Rate limiting (consider implementing)
- Monitor for unusual patterns

## Best Practices

1. **Connection Management**: Always use the connection caching
2. **Error Handling**: Implement comprehensive error handling
3. **Monitoring**: Set up proper logging and monitoring
4. **Testing**: Test thoroughly before deploying
5. **Documentation**: Keep API documentation updated

## Support

If you encounter issues:

1. Check Vercel function logs
2. Check MongoDB Atlas logs
3. Review the connection configuration
4. Test locally with the same environment variables
5. Monitor performance metrics

## Changelog

- **v1.1.1**: Added optimized MongoDB connection for Vercel
- **v1.1.0**: Implemented connection caching and error handling
- **v1.0.0**: Initial version with basic connection
