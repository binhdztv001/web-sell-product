// Ném lỗi có status; error handler trong app.js sẽ trả về cho client
module.exports = (status, message) => Object.assign(new Error(message), { status });
