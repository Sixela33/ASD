const validateEmail = (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
};

const validatePassword = (input) => {
    const minLength = 4;
    const hasUpperCase = /[A-Z]/.test(input);
    
    return input.length >= minLength && hasUpperCase;
};

export { validateEmail, validatePassword };
