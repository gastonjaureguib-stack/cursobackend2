export const getSessionStatus = (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Sessions disponible'
    });
};