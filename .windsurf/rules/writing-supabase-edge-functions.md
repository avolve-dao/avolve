---
# Windsurf Rules
description: Guidelines for writing Supabase Edge Functions
globs: 'supabase/functions/**/*.ts'
---

# Supabase Edge Functions: Development Guide

When writing Edge Functions for Supabase, follow these guidelines to ensure optimal performance, security, and maintainability.

## General Principles

1. **Keep Functions Focused**
   - Each function should do one thing and do it well
   - Break complex operations into multiple functions when appropriate
   - Consider using middleware for cross-cutting concerns

2. **Optimize for Cold Starts**
   - Minimize dependencies to reduce initialization time
   - Use dynamic imports for rarely-used functionality
   - Keep function size small

3. **Error Handling**
   - Implement comprehensive error handling
   - Return appropriate HTTP status codes
   - Structure error responses consistently

4. **Security First**
   - Validate and sanitize all inputs
   - Implement proper authentication checks
   - Follow the principle of least privilege

## Function Structure

Use this template for Edge Functions:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

interface RequestParams {
  // Define the expected parameters
}

interface ResponseData {
  // Define the response structure
}

serve(async (req) => {
  try {
    // 1. Extract and validate request data
    const { method, url } = req
    
    // Only accept appropriate methods
    if (method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // 2. Parse request body
    const requestData: RequestParams = await req.json()
    
    // 3. Validate inputs
    if (!requestData.requiredField) {
      return new Response(
        JSON.stringify({ error: 'Missing required field' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // 4. Initialize Supabase client (if needed)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )
    
    // 5. Authenticate request (if required)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // 6. Process the request
    // ...your logic here...
    
    // 7. Prepare and return the response
    const responseData: ResponseData = {
      // Populate with your response data
      success: true,
      data: {}
    }
    
    return new Response(
      JSON.stringify(responseData),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    // Log the error (consider using a proper logging solution)
    console.error('Function error:', error.message)
    
    // Return a generic error to the client
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

## Authentication & Authorization

1. **Verify JWT Tokens**
   ```typescript
   // Get the JWT from the Authorization header
   const authHeader = req.headers.get('Authorization')?.split(' ')[1]
   if (!authHeader) {
     return new Response(
       JSON.stringify({ error: 'Missing authorization token' }),
       { status: 401, headers: { 'Content-Type': 'application/json' } }
     )
   }
   
   try {
     // Verify the JWT token
     const { data: { user }, error } = await supabaseClient.auth.getUser(authHeader)
     
     if (error || !user) {
       return new Response(
         JSON.stringify({ error: 'Invalid token' }),
         { status: 401, headers: { 'Content-Type': 'application/json' } }
       )
     }
     
     // User is authenticated, continue processing
   } catch (error) {
     return new Response(
       JSON.stringify({ error: 'Authentication error' }),
       { status: 401, headers: { 'Content-Type': 'application/json' } }
     )
   }
   ```

2. **Role-Based Access Control**
   - Check user roles before performing operations
   - Create helper functions for common authorization checks

## Performance Optimization

1. **Minimize Database Queries**
   - Batch related queries where possible
   - Use pagination for large result sets
   - Select only the columns you need

2. **Use Caching When Appropriate**
   - Consider caching frequently accessed, rarely changing data
   - Implement proper cache invalidation strategies

3. **Optimize Network Requests**
   - Minimize external API calls
   - Implement request batching and retries with exponential backoff

## Error Handling Best Practices

1. **Consistent Error Responses**
   ```typescript
   function errorResponse(status: number, message: string, details?: any) {
     return new Response(
       JSON.stringify({
         error: message,
         details: details || undefined,
         status
       }),
       { status, headers: { 'Content-Type': 'application/json' } }
     )
   }
   
   // Usage:
   if (!requiredParam) {
     return errorResponse(400, 'Missing required parameter', { param: 'requiredParam' })
   }
   ```

2. **Try-Catch Blocks**
   - Wrap all async operations in try-catch blocks
   - Handle specific error types appropriately
   - Always have a fallback catch-all error handler

## Input Validation

1. **Validate All Inputs**
   ```typescript
   // Basic validation
   if (typeof requestData.username !== 'string' || requestData.username.length < 3) {
     return errorResponse(400, 'Invalid username', {
       username: 'Must be a string with at least 3 characters'
     })
   }
   
   // Number validation
   if (typeof requestData.age !== 'number' || requestData.age < 18) {
     return errorResponse(400, 'Invalid age', {
       age: 'Must be a number greater than or equal to 18'
     })
   }
   ```

2. **Consider Using a Validation Library**
   - For complex validation requirements, consider a validation library
   - Ensure the library is lightweight to minimize impact on cold start times

## Testing Edge Functions

1. **Unit Testing**
   - Test individual components and helpers
   - Mock external dependencies

2. **Integration Testing**
   - Test the function as a whole
   - Use real Supabase instances in development/testing

3. **Local Development**
   - Use Supabase CLI for local development and testing
   - Test with representative data

## Deployment Best Practices

1. **Environment Variables**
   - Use environment variables for configuration
   - Never hardcode sensitive information

2. **Versioning**
   - Consider including version information in your function paths
   - Implement strategies for backward compatibility

3. **Documentation**
   - Document the purpose and usage of each function
   - Include example requests and responses

By following these guidelines, you'll create Edge Functions that are secure, performant, and maintainable.
