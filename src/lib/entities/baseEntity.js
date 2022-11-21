'use strict';

class BaseEntity {

    /**
     * @param {Object} data
     */
    constructor(data) {
        this._validateAttributes(data);
        this.data = this._prepareData(data);
    }

    /**
     * {Object} data
     * @return {Object}
     * @protected
     */
    _prepareData(data) {
        throw new Error("Implement method _prepareData for " + this.constructor.name);
    }

    /**
     * @return {string[]}
     * @protected
     */
    _getRequiredAttributes() {
        throw new Error("Implement method _getRequiredAttributes for " + this.constructor.name);
    }

    /**
     * @param {Object} data
     * @return {void}
     * @protected
     */
    _validateAttributes(data = {}) {
        const requiredAttributes = this._getRequiredAttributes();
        const missingAttributes = requiredAttributes.filter(attr => Object.keys(data).indexOf(attr) === -1);
        if (missingAttributes.length > 0) {
            throw new Error("Missing attributes: " + missingAttributes);
        }
    }
}

module.exports = BaseEntity;