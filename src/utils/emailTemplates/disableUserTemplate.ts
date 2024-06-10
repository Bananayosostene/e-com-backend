const statusDisactivation = (user: string, description: string) =>
    `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin:10px">
      <h2 style="">Dear ${user},</h2>
      <p>We regret to inform you that you have been disabled from using e-commerce bitcrafters website because of the following reasons:</p>
      <p>${description}</p>
      <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
      <p>Best regards,</p>
      <p>Bitcrafters Andela Team</p>
    </div>
  `
  export default statusDisactivation
  