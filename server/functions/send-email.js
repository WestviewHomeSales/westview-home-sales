// This function sends an email using SendGrid
const sgMail = require('@sendgrid/mail');

exports.handler = async (event) => {
  // Check if this is a POST request
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse the JSON body
    const body = JSON.parse(event.body);
    const { name, email, phone, message } = body;

    // Log for debugging
    console.log('Contact form submission received:', {
      name,
      email,
      phone: phone || 'Not provided',
      message
    });

    // Check if SendGrid API key is configured
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return {
        statusCode: 200, // Use 200 to allow client to see the error message
        body: JSON.stringify({
          success: false,
          message: 'Email configuration is not set up properly. Please try contacting us directly.'
        })
      };
    }

    // Configure SendGrid
    sgMail.setApiKey(SENDGRID_API_KEY);

    // Create email content
    const msg = {
      to: 'WestviewHomeSales@gmail.com',
      from: 'website@westviewhs.com', // This should be a verified sender in your SendGrid account
      replyTo: email,
      subject: `Website Contact Form: ${name}`,
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Message:
${message}
      `,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    // Send the email
    await sgMail.send(msg);
    console.log('Email sent successfully via server function');

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Email sent successfully'
      })
    };
  } catch (error) {
    console.error('Error sending email via server function:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Failed to send email. Please try contacting us directly.',
        error: error.message
      })
    };
  }
};
