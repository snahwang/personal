const fetch = require('node-fetch');
const crypto = require('crypto');

exports.handler = async (event) => {
    const { email, request_id } = JSON.parse(event.body);
    const baseUrl = "https://groupware.zigbang.io";
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from('c9f5a5d4a4b0e9d6f92c5d6d9c3a4f1b63e7b2d2e1a9b8f1a3c5f9d6b3a7f9e1', 'hex');
    const iv = Buffer.from('b3d4e5f6a1c2b3d4e5f6a7c2b3d4f5a1', 'hex');

    // 날짜 포맷
    const getToday = () => {
        const today = new Date();
        return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    };

    // 암호화 함수
    const encData = (text) => {
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    };

    const today = getToday();
    const combined = `${email}|${today}|${request_id}`;
    const code = encData(combined);

    try {
        const response = await fetch(`${baseUrl}/slack/attendance/start?code=${code}`, {
            method: 'GET',
            headers: { 'x-forwarded-for': '118.32.128.188' } // 지정된 IP
        });

        const responseText = await response.text(); 
        return {
            statusCode: response.status,
            body: JSON.stringify({
                message: "Request sent successfully!",
                responseText: responseText
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to send request", error: error.message })
        };
    }
};
