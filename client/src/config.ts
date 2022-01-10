// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'evjghxm5h4'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-vji0yqkp.us.auth0.com',            // Auth0 domain
  clientId: 'KN7DyyyQHgUWeCVGahfgwyAu1SJceWnP',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
