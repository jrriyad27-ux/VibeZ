const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');

// আপনার টেলিগ্রাম বট টোকেন (BotFather থেকে পাবেন)
const token = '8885549218:AAHu_3xTjxoLWMz7TUShqMRhy2USk-0Ht6M';
const adminChatId = '5460120749'; // আপনার নিজের টেলিগ্রাম আইডি

const bot = new TelegramBot(token, {polling: true});
const app = express();
app.use(bodyParser.json());

// টেলিগ্রাম কমান্ড: /stats - অ্যাপের বর্তমান ইউজার এবং ইনকাম চেক করতে
bot.onText(/\/stats/, (msg) => {
    if(msg.chat.id.toString() !== adminChatId) return; // শুধু আপনি কন্ট্রোল করবেন
    
    // (এখানে Firebase Admin SDK দিয়ে রিয়েল ডাটা ফেচ করা হবে)
    const stats = `
📊 *App Statistics:*
Total Active Users: 12,543
Total Deposits Pending: 15 ($450)
Withdrawal Requests: 5 ($50)
💰 *Estimated Ad Revenue:* $120.50
    `;
    bot.sendMessage(adminChatId, stats, {parse_mode: 'Markdown'});
});

// ইউজারের অ্যাপ থেকে উইথড্র রিকোয়েস্ট আসলে এই API কল হবে এবং আপনার টেলিগ্রামে মেসেজ যাবে
app.post('/api/withdraw', (req, res) => {
    const { email, amount, address } = req.body;
    
    const message = `🚨 *New Withdraw Request* 🚨\nUser: ${email}\nAmount: $${amount}\nAddress: ${address}`;
    
    // টেলিগ্রামে Accept / Reject বাটন সহ মেসেজ পাঠানো
    const options = {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '✅ Approve & Pay', callback_data: `approve_${email}` }],
                [{ text: '❌ Reject', callback_data: `reject_${email}` }]
            ]
        }
    };
    
    bot.sendMessage(adminChatId, message, options);
    res.json({ success: true, message: "Sent to admin" });
});

// টেলিগ্রামের বাটনে ক্লিক করলে যা হবে
bot.on('callback_query', (query) => {
    const action = query.data.split('_')[0];
    const userEmail = query.data.split('_')[1];

    if(action === 'approve') {
        bot.sendMessage(adminChatId, `✅ Approved payment for ${userEmail}. Please send money manually to their address.`);
        // এখানে ফায়ারবেস ডাটাবেস আপডেট করে ইউজারের ব্যালেন্স কেটে নেওয়া হবে
    } else if(action === 'reject') {
        bot.sendMessage(adminChatId, `❌ Rejected payment for ${userEmail}.`);
    }
});

// সার্ভার স্টার্ট
app.listen(3000, () => {
    console.log("Backend Server and Telegram Bot are running...");
});
