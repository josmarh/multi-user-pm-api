const validate = validations => {
    return async (req, res, next) => {
        // sequential processing, stops running validations chain if one fails.
        for (const validation of validations) {
            const result = await validation.run(req);
            if (!result.isEmpty()) {
                const errorMsg = result.array().map(err => err.msg);

                return res.status(400).json({ 
                    errors: errorMsg
                });
            }
        }
    
        next();
    };
};

module.exports = validate