// File: server/controllers/notificationController.js

const twilio = require('twilio');

// Securely read credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// The Content SID for your pre-approved WhatsApp template
const contentSid = 'HXb5b62575e6e4ff6129ad7c8efe1f983e';

const client = twilio(accountSid, authToken);

exports.sendNewDeliverySms = async (agent, customer) => {
    console.log("--- sendNewDeliverySms (WhatsApp) function has been triggered ---");
    console.log("Agent details:", { id: agent.id, mobile: agent.mobile, notifications: agent.notifications_enabled });

    if (!agent || !agent.mobile || !agent.notifications_enabled) {
        console.log(`Notification for agent ${agent?.id} SKIPPED (no mobile # or notifications disabled).`);
        return;
    }

    // CORRECTED: Format the agent's phone number for WhatsApp.
    // This now correctly handles numbers that may or may not have the '+' prefix.
    const cleanNumber = agent.mobile.replace(/\D/g, '');
    const agentPhoneNumber = `whatsapp:+${cleanNumber}`;
    
    console.log("Formatted WhatsApp number for Twilio:", agentPhoneNumber);

    try {
        console.log("Attempting to send WhatsApp message via Twilio...");
        
        const message = await client.messages.create({
            contentSid: contentSid,
            from: twilioPhoneNumber,
            to: agentPhoneNumber,
            // Dynamically populate the variables in your WhatsApp template.
            // This assumes your template has two variables:
            // {{1}} for the customer's name
            // {{2}} for the customer's address
            contentVariables: JSON.stringify({
                "1": customer.name,
                "2": customer.address
            }),
        });
        
        console.log(`WhatsApp notification sent successfully to ${agentPhoneNumber}. SID: ${message.sid}`);
    } catch (error) {
        console.error(`Failed to send WhatsApp message to ${agentPhoneNumber}. Error:`, error.message);
    }
};
