export const errorHandler = (
    error,
    req,
    res,
    next
) => {
    const statusCode =
        error.statusCode || 500;

    const message =
        error.message ||
        'Error interno del servidor';

    return res.status(statusCode).json({
        status: 'error',
        message
    });
};