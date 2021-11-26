const validator = require('validate.js')
    , PasswordValidator = require('password-validator')
    , privateKeyConstraints = require('./constraints/privateKey')
    , recoveryDataConstraints = require('./constraints/recoveryData')
;

class Validator {
    constructor() {
        this.validator = validator;
        this.validator.validators.objectArray = (value, options) => {
            if (Array.isArray(value)) {
                return value.reduce((errors, item, index) => {
                    const error = this.validator.validate(item, options);
                    if (error) {
                        errors[index] = error;
                    }

                    return errors;
                }, {});
            }

            return null;
        };
        this.passwordValidator = new PasswordValidator();
    }

    /**
     * @param {object} data
     * @return {boolean}
     */
    validatePrivateKey(data) {
        return this.validator.validate(data, privateKeyConstraints);
    }

    /**
     * @param {object} data
     * @return {boolean}
     */
    validateRecoveryData(data) {
        return this.validator.validate(data, recoveryDataConstraints);
    }

    /**
     * @param {string} password
     * @return {boolean}
     */
    validatePassword(password) {
        this.passwordValidator
            .is().min(8)
            .has().uppercase(1)
            .has().digits(1)
            .has().symbols(1)
        ;

        return this.passwordValidator.validate(password);
    }
}

module.exports = Validator;