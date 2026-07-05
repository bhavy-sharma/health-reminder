// lib/auth.js
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function getAuthenticatedUser(request) {
  console.log('Auth: Starting authentication check...');

  try {
    // 1. Get token from cookie
    const token = request.cookies.get("token")?.value;
    
    if (!token) {
      console.log('Auth: No token found in cookies');
      return { 
        authenticated: false, 
        error: 'No authentication token found'
      };
    }

    // 2. Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
      console.log('Auth: Token verified successfully for user:', decoded.userId);
    } catch (error) {
      console.error('Auth: Token verification failed:', error.message);
      return { 
        authenticated: false, 
        error: 'Invalid or expired token'
      };
    }

    // 3. Get user ID from token
    const userId = decoded.userId || decoded.sub;
    if (!userId) {
      console.log('Auth: No userId found in token');
      return { 
        authenticated: false, 
        error: 'Invalid token format'
      };
    }

    // 4. Connect to database and fetch user
    await connectToDatabase();
    console.log('Auth: Database connected, fetching user...');
    
    const user = await User.findById(userId).select('-password -otp -resetToken').lean();
    
    if (!user) {
      console.log('Auth: User not found in database:', userId);
      return { 
        authenticated: false, 
        error: 'User not found' 
      };
    }

    console.log('Auth: User found:', { 
      userId: user._id, 
      email: user.email, 
      role: user.role,
      isSuspended: user.isSuspended 
    });

    // 5. Check if account is suspended
    if (user.isSuspended) {
      console.log('Auth: User is suspended:', userId);
      return {
        authenticated: false,
        isSuspended: true,
        suspendedReason: user.suspendedReason || 'Account suspended',
        suspendedAt: user.suspendedAt,
        userId: user._id,
        error: 'Account suspended',
        status: 403
      };
    }

    // 6. Return full user data
    return {
      authenticated: true,
      userId: user._id,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
      mobile: user.mobile,
      isVerified: user.isVerified,
      isSuspended: user.isSuspended,
      activeFamilyId: user.activeFamilyId,
      families: user.families,
      profile: user.profile,
      lastLogin: user.lastLogin,
      user: user
    };
    
  } catch (error) {
    console.error("Auth helper error:", error);
    return { 
      authenticated: false, 
      error: error.message || 'Authentication failed'
    };
  }
}

// Helper function specifically for checking roles and suspension
export async function validateUserRole(request, requiredRole) {
  console.log('Auth: Validating user role...');
  const auth = await getAuthenticatedUser(request);
  
  console.log('Auth: Validation result:', { 
    authenticated: auth.authenticated, 
    role: auth.role,
    isSuspended: auth.isSuspended 
  });
  
  // Check authentication
  if (!auth.authenticated) {
    if (auth.isSuspended) {
      return { 
        valid: false, 
        error: auth.error || 'Account suspended',
        reason: auth.suspendedReason,
        status: 403 
      };
    }
    return { 
      valid: false, 
      error: auth.error || 'Please login to continue', 
      status: 401 
    };
  }
  
  // Check if user is suspended (already checked in getAuthenticatedUser, but double-check)
  if (auth.isSuspended) {
    return { 
      valid: false, 
      error: 'Account suspended', 
      reason: auth.suspendedReason,
      status: 403 
    };
  }
  
  // Check role if required
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(auth.role)) {
      console.log('Auth: Role check failed. Required:', roles, 'Actual:', auth.role);
      return { 
        valid: false, 
        error: `${roles.join(' or ')} access required`, 
        status: 403 
      };
    }
  }
  
  console.log('Auth: Role validation successful for user:', auth.email);
  return { valid: true, user: auth };
}

// Simplified helper for API routes - returns user or throws error
export async function requireAuth(request, options = {}) {
  const { requireAdmin = false, requireDoctor = false } = options;
  
  const auth = await getAuthenticatedUser(request);
  
  if (!auth.authenticated) {
    if (auth.isSuspended) {
      throw new Error('ACCOUNT_SUSPENDED');
    }
    throw new Error('UNAUTHORIZED');
  }
  
  if (requireAdmin && auth.role !== 'admin') {
    throw new Error('ADMIN_REQUIRED');
  }
  
  if (requireDoctor && auth.role !== 'doctor') {
    throw new Error('DOCTOR_REQUIRED');
  }
  
  return auth;
}