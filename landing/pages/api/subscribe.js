// API Route: /api/subscribe
// Handles waitlist subscription requests with Supabase

// Simple in-memory rate limiting (resets on server restart)
// For production, use Redis or a database
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 3; // Max 3 requests per minute per IP

// Sanitize input - remove any HTML/script tags
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"`;(){}[\]]/g, '') // Remove dangerous characters
    .trim()
    .slice(0, 254); // Limit length
}

// Check for suspicious patterns
function containsSuspiciousContent(input) {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i, // onclick=, onerror=, etc.
    /data:/i,
    /vbscript:/i,
    /expression\(/i,
    /url\(/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<svg/i,
    /&#/i, // HTML entities
    /%3C/i, // URL encoded <
    /%3E/i, // URL encoded >
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
}

// Rate limiting check
function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return { allowed: true };
  }
  
  // Reset if window has passed
  if (now - record.firstRequest > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return { allowed: true };
  }
  
  // Increment count
  record.count++;
  
  if (record.count > MAX_REQUESTS) {
    return { 
      allowed: false, 
      retryAfter: Math.ceil((record.firstRequest + RATE_LIMIT_WINDOW - now) / 1000) 
    };
  }
  
  return { allowed: true };
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
    
    // Rate limiting
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: `Too many requests. Please try again in ${rateLimit.retryAfter} seconds.`,
      });
    }

    const { email, honeypot, timestamp } = req.body;

    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      // Silently reject but return success to confuse bots
      console.log('🤖 Bot detected (honeypot):', ip);
      return res.status(200).json({
        success: true,
        message: 'Successfully joined the waitlist!',
      });
    }

    // Time-based check - if form submitted too fast (< 2 seconds), likely a bot
    if (timestamp) {
      const submissionTime = Date.now() - parseInt(timestamp, 10);
      if (submissionTime < 2000) {
        console.log('🤖 Bot detected (too fast):', ip);
        return res.status(200).json({
          success: true,
          message: 'Successfully joined the waitlist!',
        });
      }
    }

    // Check for suspicious content
    if (containsSuspiciousContent(email)) {
      console.log('⚠️ Suspicious input detected:', email.substring(0, 50));
      return res.status(400).json({
        success: false,
        message: 'Invalid input detected.',
      });
    }

    // Sanitize and validate email
    const sanitizedEmail = sanitizeInput(email);
    
    if (!sanitizedEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Strict email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Block disposable email domains (common spam sources)
    const disposableDomains = [
      'tempmail.com', 'throwaway.com', 'mailinator.com', 'guerrillamail.com',
      'temp-mail.org', '10minutemail.com', 'fakeinbox.com', 'trashmail.com',
    ];
    const emailDomain = sanitizedEmail.split('@')[1]?.toLowerCase();
    if (disposableDomains.includes(emailDomain)) {
      return res.status(400).json({
        success: false,
        message: 'Please use a valid email address.',
      });
    }

    // Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
      });
    }

    // Check if email already exists
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/waitlist?email=eq.${encodeURIComponent(sanitizedEmail)}&select=id`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const existingEntries = await checkResponse.json();

    if (existingEntries && existingEntries.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You are already on the waitlist!',
      });
    }

    // Insert new subscriber into Supabase
    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/waitlist`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          email: sanitizedEmail.toLowerCase(),
          subscribed_at: new Date().toISOString(),
          source: 'landing-page',
          ip_address: ip,
          user_agent: sanitizeInput(req.headers['user-agent'] || '').slice(0, 500),
        }),
      }
    );

    if (!insertResponse.ok) {
      const error = await insertResponse.json();
      console.error('Supabase insert error:', error);
      
      // Check for unique constraint violation
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'You are already on the waitlist!',
        });
      }
      
      throw new Error('Failed to save subscription');
    }

    const data = await insertResponse.json();
    // console.log('✅ New waitlist signup:', email);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Successfully joined the waitlist!',
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.',
    });
  }
}
