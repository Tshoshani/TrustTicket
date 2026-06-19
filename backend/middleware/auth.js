/**
 * middleware/auth.js - Role-based authorization middleware.
 *
 * Since there is no real login system in this assignment, authentication is
 * simulated by reading the user's role from the "x-user-role" request header.
 * Each protected route specifies which roles are allowed (e.g., ['admin']).
 *
 * Usage in routes:
 *   router.delete('/:id', authorize(['admin']), controller.delete);
 *
 * If the header value matches one of the allowed roles -> request proceeds.
 * Otherwise -> 403 Forbidden with a JSON error response.
 */
function authorize(allowedRoles) {
  // Return the actual middleware function (closure keeps allowedRoles in scope)
  return (req, res, next) => {
    // Read the simulated role from the request header
    const userRole = req.headers['x-user-role'];

    if (allowedRoles.includes(userRole)) {
      // Role is permitted - continue to the route handler
      next();
    } else {
      // Role is missing or not in the allowed list - deny access
      res.status(403).json({
        success: false,
        data: null,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to perform this action.",
          details: { requiredRoles: allowedRoles, yourRole: userRole || "none" }
        }
      });
    }
  };
}

/**
 * authorize.selfOrRoles(allowedRoles) - "Self update" authorization.
 *
 * Allows the request if EITHER:
 *   1. The caller's role (x-user-role) is in allowedRoles (e.g., admin/manager), OR
 *   2. The caller is editing their OWN record - i.e. the "x-user-id" header
 *      matches the ":id" route parameter.
 *
 * This lets a regular "user" update their own profile (PUT /users/:id where
 * :id is their own id) while still letting admins/managers update anyone.
 *
 * Usage:
 *   router.put('/:id', authorize.selfOrRoles(['admin', 'manager']), controller.update);
 */
authorize.selfOrRoles = function (allowedRoles) {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    const callerId = parseInt(req.headers['x-user-id']);
    const targetId = parseInt(req.params.id);

    const isPrivileged = allowedRoles.includes(userRole);
    const isSelf = !isNaN(callerId) && !isNaN(targetId) && callerId === targetId;

    if (isPrivileged || isSelf) {
      next();
    } else {
      res.status(403).json({
        success: false,
        data: null,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to perform this action.",
          details: { requiredRoles: allowedRoles, allowSelf: true, yourRole: userRole || "none" }
        }
      });
    }
  };
};

module.exports = authorize;
