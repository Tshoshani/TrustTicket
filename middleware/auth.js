// middleware/auth.js

function authorize(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role']; 

    if (allowedRoles.includes(userRole)) {
      next(); 
    } else {
      res.status(403).json({
        "success": false,
        "data": null,
        "error": {
          "code": "FORBIDDEN",
          "message": "You do not have permission to perform this action.",
          "details": { "requiredRoles": allowedRoles, "yourRole": userRole || "none" }
        }
      });
    }
  };
}

module.exports = authorize;