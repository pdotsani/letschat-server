import { supabase } from "../lib/supabaseClient";

export async function jwtAuth(req: any, res: any, next: any) {
  // Development: skip auth entirely
  if (process.env.NODE_ENV !== 'production') {
    return next()
  }

  // Production: verify token
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
    
    req.user = user
    next()
  } catch (err) {
    console.error('Auth error:', err)
    return res.status(500).json({ error: 'Authentication failed' })
  }
}