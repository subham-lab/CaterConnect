/**
 * Lightweight validation middleware — no extra npm packages
 *
 * Usage:
 *   router.post('/register', validate({
 *     businessName: { required: true, minLength: 2, maxLength: 100 },
 *     phone:        { required: true, pattern: /^[6-9]\d{9}$/ },
 *     pricePerPlate:{ type: 'number', min: 1, max: 100000 },
 *   }), handler)
 */
const validate = (schema) => (req, res, next) => {
  const errors = []
  const body   = req.body

  for (const [field, rules] of Object.entries(schema)) {
    const val = body[field]

    // required
    if (rules.required && (val === undefined || val === null || val === '')) {
      errors.push(`${field} is required`)
      continue
    }

    // Skip remaining checks if field is absent and not required
    if (val === undefined || val === null || val === '') continue

    // type
    if (rules.type === 'number' && isNaN(Number(val))) {
      errors.push(`${field} must be a number`)
      continue
    }
    if (rules.type === 'boolean' && typeof val !== 'boolean') {
      errors.push(`${field} must be true or false`)
    }

    // string length
    if (rules.minLength && String(val).length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`)
    }
    if (rules.maxLength && String(val).length > rules.maxLength) {
      errors.push(`${field} must be at most ${rules.maxLength} characters`)
    }

    // numeric range
    if (rules.min !== undefined && Number(val) < rules.min) {
      errors.push(`${field} must be at least ${rules.min}`)
    }
    if (rules.max !== undefined && Number(val) > rules.max) {
      errors.push(`${field} must be at most ${rules.max}`)
    }

    // pattern
    if (rules.pattern && !rules.pattern.test(String(val))) {
      errors.push(rules.message || `${field} is invalid`)
    }

    // enum
    if (rules.enum && !rules.enum.includes(val)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`)
    }
  }

  if (errors.length) {
    return res.status(400).json({ message: errors[0], errors })
  }

  next()
}

// Common pre-built validators
const reviewValidation = validate({
  rating:  { required: true, type: 'number', min: 1, max: 5 },
  comment: { required: true, minLength: 10, maxLength: 1000 },
})

const menuItemValidation = validate({
  name:          { required: true, minLength: 2, maxLength: 100 },
  pricePerPlate: { required: true, type: 'number', min: 1, max: 100000 },
  category:      { enum: ['Starter','Main Course','Dessert','Beverages','Snacks','Breads','Rice'] },
})

module.exports = { validate, reviewValidation, menuItemValidation }
