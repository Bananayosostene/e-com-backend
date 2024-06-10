export const verificationsEmailTemplate = (username: string, baseUrl: string) =>
  `<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Eo_circle_light-blue_letter-b.svg/768px-Eo_circle_light-blue_letter-b.svg.png?20200417144911" style="width:50px; height:50px; margin-top:10px"/>
  <div style="flex-direction: column; display:flexu; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin:10px">
  <h2 style="">Hello ${username.split(' ')[0]},</h2>
  <p style="font-weight:600">Thank you for choosing us, you are on button away from signing up.</p>
  <div style="flex-direction: column; display:flex; margin:0px">
  </div>
  <p>Please click on the following button to verify your account </p>
  <a href="${baseUrl}" style="align-self:center; margin:10px auto;"><button style="background-color: #4C4C9F; border:none; color:white; border-radius: 5px;; padding:10px;">Verify Account </button></a>
  <p>For Enquiry you can reach out to our support team</p>
  <div style="border:1px solid rgba(0,0,0,.2); margin:20px 0px"></div>
  <p>Bitcrafters - Andela Team </p>
  <div>
  <div style="display:flex; gap:10px; align-items:center; justify-content:start">
  <a href="mailto:bitcrafters.andela@gmail.com">
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6c/Phone_icon.png?20210306055547" style="width:20px; height:20px"/>
  </a>
  <a href="mailto:bitcrafters.andela@gmail.com">
  <img src="https://cdn.icon-icons.com/icons2/1097/PNG/512/1485477030-mail_78575.png" style="width:30px; height:30px; "/>
  </a>
  </div>
  <p style="font-size:12px">If button doen't work use this link</p>
  <p style="font-size:12px">${baseUrl}</p>
  <div style="border:1px solid rgba(0,0,0,.2); margin:5px 0px ; margin-top:15px"></div>
  <div style="display:flex; flex-direction:column; gap:0px; align-items:center; margin:3px">
  <p style="font-size:12px"> Bitcrafters Andela Team </p>
  <p style="font-size:12px"> &copy; All rights reserved - 2024</p>
  </div>
  </div>
  `
export const successfulCreationTemplate = () =>
  `Your account has been successfully created!`
