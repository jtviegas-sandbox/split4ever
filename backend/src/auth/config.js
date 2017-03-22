var AuthenticationConfig = {};
AuthenticationConfig.vcap = '{ "SingleSignOn": [ \
    { \
      "name": "sso", \
      "label": "SingleSignOn", \
      "plan": "standard", \
      "credentials": { \
        "secret": "E6ANLZrR6JhCdvat3b6F", \

        "tokenEndpointUrl": "https://ssoexp-ucv0ssb7w7-ct20.iam.ibmcloud.com/idaas/sps/oauth/oauth20/token", \
        "authorizationEndpointUrl": "https://ssoexp-ucv0ssb7w7-ct20.iam.ibmcloud.com/idaas/oidc/endpoint/default/authorize", \
        "issuerIdentifier": "ssoexp-ucv0ssb7w7-ct20.iam.ibmcloud.com", \
        "clientId": "ssoexp-ucv0ssb7w7-ct20.iam.ibmcloud.com_CaGgwbU86Yr5qH9kILM4", \
        "serverSupportedScope": [ \
          "openid" \
        ] \
      } \
    } \
  ] \
}';
module.exports = AuthenticationConfig;