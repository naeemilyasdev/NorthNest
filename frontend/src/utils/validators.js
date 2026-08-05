export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email?.trim() || '');
};

export const validatePassword = (password, minLength = 8) => {
  return (password || '').trim().length >= minLength;
};

export const validateName = (name) => {
  return (name || '').trim().length >= 2;
};

export const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone.replace(/\D/g, ''));
};

export const validateForm = (data, rules) => {
  const errors = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    if (rule.required && !value) {
      errors[field] = `${field} is required`;
      continue;
    }

    if (rule.minLength && value?.length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters`;
    }

    if (rule.maxLength && value?.length > rule.maxLength) {
      errors[field] = `${field} must not exceed ${rule.maxLength} characters`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${field} is invalid`;
    }

    if (rule.validate && !rule.validate(value)) {
      errors[field] = rule.message || `${field} is invalid`;
    }
  }

  return errors;
};
